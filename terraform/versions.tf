terraform {
  required_version = ">= 1.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.40"
    }
  }

  # État distant recommandé en production (à décommenter et configurer) :
  # backend "s3" {
  #   bucket         = "mon-bucket-tfstate"
  #   key            = "microservices-ecommerce/terraform.tfstate"
  #   region         = "eu-west-3"
  #   dynamodb_table = "terraform-locks"
  #   encrypt        = true
  # }
}
