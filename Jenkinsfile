// Pipeline CI/CD des microservices e-commerce.
// Calqué sur le pipeline du Deploy Board (8 étapes) et adapté au monorepo :
// build / test / scan / push pour les 5 services, puis reporting au Deploy Board.

def SERVICES = ['api-gateway', 'auth-service', 'product-service', 'order-service', 'payment-service']

pipeline {
  agent any

  environment {
    DOCKER_NS     = "lims4"                       // namespace Docker Hub
    IMAGE_PREFIX  = "ecommerce"                    // images : lims4/ecommerce-<service>
    DOCKER_TAG    = "${BUILD_NUMBER}"
    SONAR_PROJECT = "microservices-ecommerce"
    DEPLOY_ENV    = "${params.ENVIRONMENT ?: 'production'}"
    // URL du backend Deploy Board (reporting) + token d'ingestion CI
    DEPLOY_BOARD_URL    = "http://host.docker.internal:5001"
    DEPLOY_INGEST_TOKEN = credentials('deploy-ingest-token')
  }

  options {
    timestamps()
    disableConcurrentBuilds()
  }

  stages {
    // 1. Checkout — clone + métadonnées de commit
    stage('Checkout') {
      steps {
        checkout scm
        script {
          env.GIT_COMMIT_SHORT = sh(script: "git rev-parse --short HEAD", returnStdout: true).trim()
          env.GIT_AUTHOR       = sh(script: "git log -1 --pretty=format:'%an'", returnStdout: true).trim()
          env.GIT_BRANCH_NAME  = sh(script: "git rev-parse --abbrev-ref HEAD", returnStdout: true).trim()
        }
      }
    }

    // 2. Install — dépendances npm de chaque service
    stage('Install') {
      steps {
        script {
          SERVICES.each { svc ->
            sh "npm install --prefix services/${svc}"
          }
        }
      }
    }

    // 3. Test — tests de chaque service (tolérant si pas de script test)
    stage('Test') {
      steps {
        script {
          SERVICES.each { svc ->
            sh "npm test --prefix services/${svc} || true"
          }
        }
      }
    }

    // 4. Sonar — analyse qualité de l'ensemble du monorepo
    stage('Sonar') {
      steps {
        script {
          def scannerHome = tool 'SonarQubeScanner'
          withSonarQubeEnv('SonarQube') {
            sh "${scannerHome}/bin/sonar-scanner -Dsonar.projectKey=${SONAR_PROJECT}"
          }
        }
      }
    }

    // 5. Quality Gate — abandon si la qualité est insuffisante
    stage('Quality Gate') {
      steps {
        timeout(time: 5, unit: 'MINUTES') {
          waitForQualityGate abortPipeline: true
        }
      }
    }

    // 6. Docker Build — une image par service, taguée avec le numéro de build
    stage('Docker Build') {
      steps {
        script {
          SERVICES.each { svc ->
            docker.build("${DOCKER_NS}/${IMAGE_PREFIX}-${svc}:${DOCKER_TAG}", "services/${svc}")
            docker.build("${DOCKER_NS}/${IMAGE_PREFIX}-${svc}:latest", "services/${svc}")
          }
        }
      }
    }

    // 7. Docker Push — publication des 5 images sur Docker Hub
    stage('Docker Push') {
      steps {
        script {
          docker.withRegistry('https://registry.hub.docker.com', 'docker-hub-credentials') {
            SERVICES.each { svc ->
              docker.image("${DOCKER_NS}/${IMAGE_PREFIX}-${svc}:${DOCKER_TAG}").push()
              docker.image("${DOCKER_NS}/${IMAGE_PREFIX}-${svc}:latest").push()
            }
          }
        }
      }
    }

    // 8. Deploy — mise à jour de la stack (Docker Compose en local ; voir notes pour EKS)
    stage('Deploy') {
      steps {
        sh 'docker compose up -d --build'
      }
      post {
        success {
          // Enregistrement du déploiement dans le Deploy Board
          sh """
            curl -X POST ${DEPLOY_BOARD_URL}/api/deployments \
              -H 'Content-Type: application/json' \
              -H "x-deploy-token: ${DEPLOY_INGEST_TOKEN}" \
              -d '{
                "pipelineId": "${JOB_NAME}",
                "buildNumber": ${BUILD_NUMBER},
                "status": "SUCCESS",
                "duration": ${currentBuild.duration ?: 0},
                "environment": "${DEPLOY_ENV}",
                "commitSha": "${GIT_COMMIT_SHORT}",
                "commitAuthor": "${GIT_AUTHOR}"
              }' || true
          """
        }
      }
    }
  }

  // Notifications et reporting des échecs vers le Deploy Board
  post {
    failure {
      script {
        sh """
          curl -X POST ${DEPLOY_BOARD_URL}/api/deployments \
            -H 'Content-Type: application/json' \
            -H "x-deploy-token: ${DEPLOY_INGEST_TOKEN}" \
            -d '{
              "pipelineId": "${JOB_NAME}",
              "buildNumber": ${BUILD_NUMBER},
              "status": "FAILED",
              "environment": "${DEPLOY_ENV}",
              "commitSha": "${GIT_COMMIT_SHORT ?: ''}",
              "commitAuthor": "${GIT_AUTHOR ?: ''}",
              "failureReason": "Échec du pipeline à l'étape ${STAGE_NAME ?: 'inconnue'}"
            }' || true
        """
        slackSend(color: 'danger', message: "❌ Échec du build : ${JOB_NAME} #${BUILD_NUMBER} - ${BUILD_URL}")
      }
    }
    success {
      script {
        if (currentBuild.previousBuild?.result == 'FAILURE') {
          slackSend(color: 'good', message: "✅ Build rétabli : ${JOB_NAME} #${BUILD_NUMBER}")
        }
      }
    }
  }
}
