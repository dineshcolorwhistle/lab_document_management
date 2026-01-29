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
                    ssh -tt -o StrictHostKeyChecking=no admin@srv648489 << 'EOF'
                    set -euo pipefail

                    APP_DIR=/home/eduwhistle-lab-document/htdocs/lab-document.eduwhistle.com/lab_document_management

                    echo "👉 Switching to app directory"
                    cd "$APP_DIR"

                    echo "👉 Verifying git repo"
                    git status

                    echo "👉 Fetching latest code"
                    git fetch origin
                    git checkout main
                    git reset --hard origin/main

                    echo "👉 Verifying ecosystem file exists"
                    test -f ecosystem.config.js

                    echo "👉 Installing backend deps"
                    npm --prefix server install --production

                    echo "👉 Building frontend"
                    npm --prefix client install
                    npm --prefix client run build

                    echo "👉 Publishing frontend assets"
                    rm -rf client/public/*
                    cp -r client/dist/* client/public/

                    echo "👉 Restarting API via PM2 ecosystem"
                    pm2 delete lab-doc-api || true
                    pm2 start ecosystem.config.js
                    pm2 save

                    echo "✅ Deployment finished successfully"
                    EOF
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
