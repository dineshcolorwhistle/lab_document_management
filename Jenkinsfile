pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
        ansiColor('xterm')
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
        // INSTALL DEPENDENCIES
        // ======================
        stage('Install Dependencies') {
            parallel {
                stage('Server Deps') {
                    steps {
                        dir('server') {
                            sh 'npm ci --include=dev'
                        }
                    }
                }
                stage('Client Deps') {
                    steps {
                        dir('client') {
                            sh 'npm ci --include=dev'
                        }
                    }
                }
            }
        }

        // ======================
        // TESTS (PARALLEL)
        // ======================
        stage('Run Tests') {
            parallel {
                stage('Server Tests') {
                    steps {
                        dir('server') {
                            sh 'npm test'
                        }
                    }
                }
                stage('Client Tests') {
                    steps {
                        dir('client') {
                            sh 'npm test -- --watchAll=false'
                        }
                    }
                }
            }
        }

        // ======================
        // BUILD CLIENT
        // ======================
        stage('Build Client') {
            steps {
                dir('client') {
                    sh 'NODE_ENV=production npm run build'
                }

                // save build output for deploy
                stash name: 'client-build', includes: 'client/dist/**'
            }
        }

        // ======================
        // DEPLOY STAGING
        // ======================
        stage('Deploy STAGING') {
            when { branch 'main' }

            steps {
                unstash 'client-build'

                sshagent(credentials: ['prod-vps-ssh']) {
                    sh '''
                    rsync -avz client/dist/ admin@srv648489:/home/eduwhistle-lab-document/htdocs/lab-document.eduwhistle.com/lab_document_management/client/public/

                    ssh admin@srv648489 "
                        set -e
                        cd /home/eduwhistle-lab-document/htdocs/lab-document.eduwhistle.com/lab_document_management

                        git fetch origin
                        git reset --hard origin/main

                        npm --prefix server ci --omit=dev

                        pm2 reload ecosystem.config.js --only lab-doc-api --env staging || \
                        pm2 start ecosystem.config.js --only lab-doc-api --env staging

                        pm2 save
                    "
                    '''
                }
            }
        }

        // ======================
        // DEPLOY PRODUCTION
        // ======================
        stage('Deploy PRODUCTION') {
            when { branch 'Production' }

            steps {
                input message: "Deploy to PRODUCTION?"

                unstash 'client-build'

                sshagent(credentials: ['prod-vps-ssh']) {
                    sh '''
                    rsync -avz client/dist/ prod-admin@srv648489:/home/eduwhistle-lab-production/htdocs/lab-document-production.eduwhistle.com/lab_document_management/client/public/

                    ssh prod-admin@srv648489 "
                        set -e
                        cd /home/eduwhistle-lab-production/htdocs/lab-document-production.eduwhistle.com/lab_document_management

                        git fetch origin
                        git reset --hard origin/Production

                        npm --prefix server ci --omit=dev

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
                sh 'curl -f https://lab-document.eduwhistle.com/health'
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
