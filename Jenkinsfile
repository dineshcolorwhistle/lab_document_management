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

        // =========================
        // STAGING DEPLOY (main)
        // =========================
        stage('Deploy to Server (STAGING)') {
            when {
                branch 'main'
            }

            steps {
                sshagent(credentials: ['prod-vps-ssh']) {
                    sh '''
                    ssh -o StrictHostKeyChecking=no admin@srv648489 "
                        set -e

                        git config --global --add safe.directory /home/eduwhistle-lab-document/htdocs/lab-document.eduwhistle.com/lab_document_management

                        cd /home/eduwhistle-lab-document/htdocs/lab-document.eduwhistle.com/lab_document_management

                        git fetch origin
                        git reset --hard origin/main

                        npm --prefix client install
                        npm --prefix client run build

                        npm --prefix server install

                        rm -rf client/public/*
                        cp -r client/dist/* client/public/

                        pm2 describe lab-doc-api >/dev/null 2>&1 && \
                        pm2 reload ecosystem.config.js --only lab-doc-api --update-env || \
                        pm2 start ecosystem.config.js --only lab-doc-api

                        pm2 save
                    "
                    '''
                }
            }
        }

        // =========================
        // PRODUCTION DEPLOY
        // =========================
        stage('Deploy to Server (PRODUCTION)') {
            when {
                branch 'Production'
            }

            steps {
                sshagent(credentials: ['prod-vps-ssh']) {
                    sh '''
                    ssh -o StrictHostKeyChecking=no prod-admin@srv648489 "
                        set -e

                        git config --global --add safe.directory /home/eduwhistle-lab-document/htdocs/lab-document-production.eduwhistle.com/lab_document_management

                        cd /home/eduwhistle-lab-document/htdocs/lab-document-production.eduwhistle.com/lab_document_management

                        git fetch origin
                        git reset --hard origin/Production

                        npm --prefix client install
                        npm --prefix client run build

                        npm --prefix server install

                        rm -rf client/public/*
                        cp -r client/dist/* client/public/

                        pm2 describe lab-doc-api >/dev/null 2>&1 && \
                        pm2 reload ecosystem.config.js --only lab-doc-api --update-env || \
                        pm2 start ecosystem.config.js --only lab-doc-api

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
