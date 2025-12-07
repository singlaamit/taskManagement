pipeline {
  agent any

  environment {
    FTP_HOST = "82.180.143.253"     // You will fill this
    FTP_PORT = "21"                  // Most FTP servers use port 21
    FTP_PATH = "/domains/mystylist.in/public_html/tasl-api"
  }

  stages {
    stage('Checkout Code') {
      steps {
        checkout scm
      }
    }

    stage('Install Dependencies') {
      steps {
        bat 'npm ci'
      }
    }

    stage('Run Tests') {
      steps {
        bat 'npm test'
      }
    }

    stage('Build Project') {
      steps {
        bat 'npm run build'
      }
    }

    stage('Zip Build Files') {
      steps {
        script {
          def ZIP_NAME = "build_${env.BUILD_NUMBER}.zip"
          env.ZIP_NAME = ZIP_NAME

          bat """
            powershell -Command "Compress-Archive -Path dist/* -DestinationPath ${ZIP_NAME} -Force"
          """
        }
      }
    }

    stage('Upload to FTP Server') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'ftp-creds', usernameVariable: 'FTP_USER', passwordVariable: 'FTP_PASS')]) {
          bat """
            curl -T "%ZIP_NAME%" "ftp://%FTP_HOST%:%FTP_PORT%%FTP_PATH%/" ^
            --user "%FTP_USER%:%FTP_PASS%" ^
            --ftp-create-dirs ^
            --fail ^
            --verbose
          """
        }
      }
    }
  }

  post {
    success {
      echo "Deployment completed successfully!"
    }
    failure {
      echo "Deployment failed — check logs."
    }
  }
}
