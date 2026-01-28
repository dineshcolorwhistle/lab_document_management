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
                        git config --global --add safe.directory /home/eduwhistle-lab-document/htdocs/lab-document.eduwhistle.com/lab_document_management &&
                        cd /home/eduwhistle-lab-document/htdocs/lab-document.eduwhistle.com/lab_document_management &&

                        git fetch origin &&
                        git reset --hard origin/main &&

                        npm --prefix client install &&
                        npm --prefix client run build &&

                        rm -rf client/public/* &&
                        cp -r client/dist/* client/public/ &&

                        pm2 reload lab-doc-api || pm2 start server/src/server.js --name lab-doc-api &&
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
