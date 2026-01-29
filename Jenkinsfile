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

                        APP_DIR=/home/eduwhistle-lab-document/htdocs/lab-document.eduwhistle.com/lab_document_management
                        API_PORT=7001

                        echo '👉 Switching to app directory'
                        cd $APP_DIR

                        echo '👉 Marking repo as safe'
                        git config --global --add safe.directory $APP_DIR

                        echo '👉 Fetching latest code'
                        git fetch origin
                        git reset --hard origin/main

                        echo '👉 Building frontend'
                        npm --prefix client install
                        npm --prefix client run build

                        echo '👉 Installing server dependencies'
                        npm --prefix server install --production

                        echo '👉 Updating public assets'
                        rm -rf client/public/*
                        cp -r client/dist/* client/public/

                        echo '👉 Restarting API (clean PM2 start)'
                        pm2 delete lab-doc-api || true
                        PORT=$API_PORT pm2 start server/src/server.js --name lab-doc-api
                        pm2 save

                        echo '✅ Deployment completed'
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
