pipeline {
  agent any

  environment {
    FTP_HOST = "82.180.143.253"     // fill this
    FTP_PORT = "21"
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

    stage('Run Tests (In-Band Fix)') {
      steps {
        // Running Jest in-band prevents worker crashes
        bat 'npm test -- --runInBand'
      }
    }

    stage('Build Project') {
      when {
        expression { currentBuild.currentResult == null || currentBuild.currentResult == 'SUCCESS' }
      }
      steps {
        bat 'npm run build'
      }
    }

    stage('Zip Build Files') {
      when {
        expression { currentBuild.currentResult == null || currentBuild.currentResult == 'SUCCESS' }
      }
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
      when {
        expression { currentBuild.currentResult == null || currentBuild.currentResult == 'SUCCESS' }
      }
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
      echo "Pipeline completed successfully!"
    }
    failure {
      echo "Pipeline failed — check logs."
    }
  }
}
