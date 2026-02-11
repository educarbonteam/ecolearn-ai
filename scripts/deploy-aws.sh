#!/bin/bash
# AWS Infrastructure Deployment Script for EcoLearn AI

set -e

# Configuration
AWS_REGION="eu-west-1"
PROJECT_NAME="ecolearn"
ENVIRONMENT="production"

echo "🚀 Deploying EcoLearn AI Infrastructure to AWS"
echo "================================================"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# 1. Create VPC and Networking
print_info "Creating VPC and networking resources..."
aws ec2 create-vpc \
    --cidr-block 10.0.0.0/16 \
    --tag-specifications "ResourceType=vpc,Tags=[{Key=Name,Value=${PROJECT_NAME}-vpc}]" \
    --region $AWS_REGION \
    --output json > vpc.json

VPC_ID=$(jq -r '.Vpc.VpcId' vpc.json)
print_info "VPC Created: $VPC_ID"

# Create subnets
aws ec2 create-subnet \
    --vpc-id $VPC_ID \
    --cidr-block 10.0.1.0/24 \
    --availability-zone ${AWS_REGION}a \
    --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=${PROJECT_NAME}-public-1}]" \
    --region $AWS_REGION

aws ec2 create-subnet \
    --vpc-id $VPC_ID \
    --cidr-block 10.0.2.0/24 \
    --availability-zone ${AWS_REGION}b \
    --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=${PROJECT_NAME}-public-2}]" \
    --region $AWS_REGION

# 2. Create RDS PostgreSQL Database
print_info "Creating RDS PostgreSQL database..."
aws rds create-db-instance \
    --db-instance-identifier ${PROJECT_NAME}-db \
    --db-instance-class db.t3.micro \
    --engine postgres \
    --engine-version 15.3 \
    --master-username ecolearn \
    --master-user-password "ChangeThisPassword123!" \
    --allocated-storage 20 \
    --vpc-security-group-ids sg-xxxxx \
    --db-subnet-group-name ${PROJECT_NAME}-db-subnet-group \
    --backup-retention-period 7 \
    --publicly-accessible false \
    --region $AWS_REGION

print_info "Database creation initiated. This may take several minutes..."

# 3. Create ECR Repositories
print_info "Creating ECR repositories..."
aws ecr create-repository \
    --repository-name ${PROJECT_NAME}-backend \
    --region $AWS_REGION \
    --image-scanning-configuration scanOnPush=true

aws ecr create-repository \
    --repository-name ${PROJECT_NAME}-frontend \
    --region $AWS_REGION \
    --image-scanning-configuration scanOnPush=true

# 4. Create ECS Cluster
print_info "Creating ECS Cluster..."
aws ecs create-cluster \
    --cluster-name ${PROJECT_NAME}-cluster \
    --capacity-providers FARGATE FARGATE_SPOT \
    --default-capacity-provider-strategy capacityProvider=FARGATE,weight=1 \
    --region $AWS_REGION

# 5. Create Application Load Balancer
print_info "Creating Application Load Balancer..."
aws elbv2 create-load-balancer \
    --name ${PROJECT_NAME}-alb \
    --subnets subnet-xxxxx subnet-yyyyy \
    --security-groups sg-xxxxx \
    --scheme internet-facing \
    --type application \
    --region $AWS_REGION

# 6. Create CloudWatch Log Groups
print_info "Creating CloudWatch Log Groups..."
aws logs create-log-group \
    --log-group-name /ecs/${PROJECT_NAME}-backend \
    --region $AWS_REGION

aws logs create-log-group \
    --log-group-name /ecs/${PROJECT_NAME}-frontend \
    --region $AWS_REGION

aws logs put-retention-policy \
    --log-group-name /ecs/${PROJECT_NAME}-backend \
    --retention-in-days 30 \
    --region $AWS_REGION

aws logs put-retention-policy \
    --log-group-name /ecs/${PROJECT_NAME}-frontend \
    --retention-in-days 30 \
    --region $AWS_REGION

# 7. Create Secrets in AWS Secrets Manager
print_info "Creating secrets in AWS Secrets Manager..."
aws secretsmanager create-secret \
    --name ${PROJECT_NAME}/openai-api-key \
    --description "OpenAI API Key for EcoLearn AI" \
    --secret-string "your-openai-api-key-here" \
    --region $AWS_REGION

aws secretsmanager create-secret \
    --name ${PROJECT_NAME}/jwt-secret \
    --description "JWT Secret for authentication" \
    --secret-string "$(openssl rand -base64 32)" \
    --region $AWS_REGION

aws secretsmanager create-secret \
    --name ${PROJECT_NAME}/tree-api-key \
    --description "Tree Nation API Key" \
    --secret-string "your-tree-api-key-here" \
    --region $AWS_REGION

# 8. Create CloudWatch Alarms
print_info "Creating CloudWatch alarms..."

# CPU Alarm
aws cloudwatch put-metric-alarm \
    --alarm-name ${PROJECT_NAME}-high-cpu \
    --alarm-description "Alert when CPU exceeds 80%" \
    --metric-name CPUUtilization \
    --namespace AWS/ECS \
    --statistic Average \
    --period 300 \
    --evaluation-periods 2 \
    --threshold 80 \
    --comparison-operator GreaterThanThreshold \
    --dimensions Name=ServiceName,Value=${PROJECT_NAME}-service Name=ClusterName,Value=${PROJECT_NAME}-cluster \
    --region $AWS_REGION

# Memory Alarm
aws cloudwatch put-metric-alarm \
    --alarm-name ${PROJECT_NAME}-high-memory \
    --alarm-description "Alert when memory exceeds 80%" \
    --metric-name MemoryUtilization \
    --namespace AWS/ECS \
    --statistic Average \
    --period 300 \
    --evaluation-periods 2 \
    --threshold 80 \
    --comparison-operator GreaterThanThreshold \
    --dimensions Name=ServiceName,Value=${PROJECT_NAME}-service Name=ClusterName,Value=${PROJECT_NAME}-cluster \
    --region $AWS_REGION

# 9. Create S3 Bucket for static assets (optional)
print_info "Creating S3 bucket for static assets..."
aws s3 mb s3://${PROJECT_NAME}-assets-${AWS_REGION} --region $AWS_REGION

aws s3api put-bucket-versioning \
    --bucket ${PROJECT_NAME}-assets-${AWS_REGION} \
    --versioning-configuration Status=Enabled

# 10. Setup CloudWatch Dashboard
print_info "Creating CloudWatch Dashboard..."
cat > dashboard-config.json << EOF
{
    "widgets": [
        {
            "type": "metric",
            "properties": {
                "metrics": [
                    ["AWS/ECS", "CPUUtilization", {"stat": "Average"}],
                    [".", "MemoryUtilization", {"stat": "Average"}]
                ],
                "period": 300,
                "stat": "Average",
                "region": "$AWS_REGION",
                "title": "ECS Metrics"
            }
        }
    ]
}
EOF

aws cloudwatch put-dashboard \
    --dashboard-name ${PROJECT_NAME}-dashboard \
    --dashboard-body file://dashboard-config.json \
    --region $AWS_REGION

print_info "✅ Infrastructure deployment complete!"
print_info ""
print_info "Next steps:"
print_info "1. Update .aws/task-definition.json with actual ARNs and IDs"
print_info "2. Configure GitHub Secrets:"
print_info "   - AWS_ACCESS_KEY_ID"
print_info "   - AWS_SECRET_ACCESS_KEY"
print_info "   - SONAR_TOKEN"
print_info "3. Push code to trigger CI/CD pipeline"
print_info ""
print_info "VPC ID: $VPC_ID"
print_info "Region: $AWS_REGION"

# Cleanup temp files
rm -f vpc.json dashboard-config.json
