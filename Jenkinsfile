pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    environment {
        NODE_ENV = 'production'
    }

    stages {

        // ======================
        // CHECKOUT
        // ======================
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        // ======================
        // SERVER INSTALL
        // ======================
        stage('Install Server Deps') {
            steps {
                dir('server') {
                    sh 'npm ci'
                }
            }
        }

        // ======================
        // CLIENT INSTALL
        // ======================
        stage('Install Client Deps') {
            steps {
                dir('client') {
                    sh 'npm ci'
                }
            }
        }

        // ======================
        // SERVER TESTS
        // ======================
        stage('Server Tests') {
            steps {
                dir('server') {
                    sh 'npm test'
                }
            }
        }

        // ======================
        // CLIENT TESTS
        // ======================
        stage('Client Tests') {
            steps {
                dir('client') {
                    sh 'npm test -- --watchAll=false'
                }
            }
        }

        // ======================
        // CLIENT BUILD
        // ======================
        stage('Build Client') {
            steps {
                dir('client') {
                    sh 'npm run build'
                }
            }
        }

        // ======================
        // STAGING DEPLOY
        // ======================
        stage('Deploy STAGING') {
            when { branch 'main' }

            steps {
                sshagent(credentials: ['prod-vps-ssh']) {
                    sh '''
                    ssh -o StrictHostKeyChecking=no admin@srv648489 "
                        set -e

                        cd /home/eduwhistle-lab-document/htdocs/lab-document.eduwhistle.com/lab_document_management

                        git fetch origin
                        git reset --hard origin/main

                        npm --prefix server ci
                        npm --prefix client ci
                        npm --prefix client run build

                        rm -rf client/public/*
                        cp -r client/dist/* client/public/

                        pm2 reload ecosystem.config.js --only lab-doc-api --env staging || \
                        pm2 start ecosystem.config.js --only lab-doc-api --env staging

                        pm2 save
                    "
                    '''
                }
            }
        }

        // ======================
        // PRODUCTION DEPLOY
        // ======================
        stage('Deploy PRODUCTION') {
            when { branch 'Production' }

            steps {
                sshagent(credentials: ['prod-vps-ssh']) {
                    sh '''
                    ssh -o StrictHostKeyChecking=no prod-admin@srv648489 "
                        set -e

                        cd /home/eduwhistle-lab-production/htdocs/lab-document-production.eduwhistle.com/lab_document_management

                        git fetch origin
                        git reset --hard origin/Production

                        npm --prefix server ci
                        npm --prefix client ci
                        npm --prefix client run build

                        rm -rf client/public/*
                        cp -r client/dist/* client/public/

                        pm2 reload ecosystem.config.js --only lab-doc-api --env production || \
                        pm2 start ecosystem.config.js --only lab-doc-api --env production

                        pm2 save
                    "
                    '''
                }
            }
        }

        // ======================
        // HEALTH CHECK
        // ======================
        stage('Health Check') {
            steps {
                sh '''
                curl -f https://lab-document.eduwhistle.com/health || exit 1
                '''
            }
        }
    }

    post {
        success {
            echo '✅ Build, Test & Deploy successful'
        }
        failure {
            echo '❌ Pipeline failed — deployment stopped'
        }
    }
}
