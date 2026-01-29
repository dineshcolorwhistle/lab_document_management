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

        stage('Build Client') {
            steps {
                dir('client') {
                    sh '''
                      npm install --include=dev
                      npm run build
                    '''
                }
            }
        }

        stage('Deploy to Server') {
            steps {
                sshagent(credentials: ['prod-vps-ssh']) {
                    sh '''
                    ssh -o StrictHostKeyChecking=no admin@srv648489 "
                        set -e

                        # Ensure repo is trusted
                        git config --global --add safe.directory /home/eduwhistle-lab-document/htdocs/lab-document.eduwhistle.com/lab_document_management

                        # Go to project directory
                        cd /home/eduwhistle-lab-document/htdocs/lab-document.eduwhistle.com/lab_document_management

                        # Update code
                        git fetch origin
                        git reset --hard origin/main

                        # Build client
                        npm --prefix client install
                        npm --prefix client run build

                        # Install server deps
                        npm --prefix server install

                        # Move client build
                        rm -rf client/public/*
                        cp -r client/dist/* client/public/

                        # PM2: restart if exists, otherwise start
                        pm2 describe lab-doc-api >/dev/null 2>&1 && \
                        pm2 restart lab-doc-api || \
                        PORT=7001 pm2 start server/src/server.js --name lab-doc-api

                        pm2 save
                    "
                    '''
                }
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