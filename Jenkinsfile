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

                        # 1. Get latest code
                        git fetch origin &&
                        git reset --hard origin/main &&

                        # 2. Build frontend
                        npm --prefix client install &&
                        npm --prefix client run build &&

                        # 3. Deploy frontend to Nginx root
                        rm -rf /home/eduwhistle-lab-document/htdocs/lab-document.eduwhistle.com/public/* &&
                        cp -r client/dist/* /home/eduwhistle-lab-document/htdocs/lab-document.eduwhistle.com/public/ &&

                        # 4. Restart backend
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
