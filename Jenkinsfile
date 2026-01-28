pipeline {
    agent any

    options {
        timestamps()
    }

    environment {
        NODE_ENV = 'production'
    }

    stages {

        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Install Server Dependencies') {
            steps {
                dir('server') {
                    sh 'npm install'
                }
            }
        }

        stage('Install Client Dependencies') {
            steps {
                dir('client') {
                    sh 'npm install'
                }
            }
        }

        stage('Build Client') {
            dir('client') {
                sh '''
                npm install --include=dev
                npm run build
                '''
            }
        }



        stage('Deploy to Server') {
            steps {
                sh '''
                cd /home/admin/htdocs/lab-document.eduwhistle.com/lab_document_management

                git fetch origin
                git reset --hard origin/main

                pm2 restart lab-doc-api || pm2 start server/src/server.js --name lab-doc-api

                pm2 save
                '''
            }
        }
    }

    post {
        success {
            echo '✅ Deployment completed successfully'
        }
        failure {
            echo '❌ Deployment failed'
        }
    }
}
