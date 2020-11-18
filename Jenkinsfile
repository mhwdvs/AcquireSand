pipeline {
    agent any

    environment{
        ENV_VARS = credentials('GPUCompare-Prod-Env')
    }

    stages {
        stage('Build') {
            steps {
                sh "echo 'Building..'"
                try{
                    sh "git clone https://github.com/mhwdvs/GPUCompare-Dockerized.git"
                }
                catch{}
                sh "cd GPUCompare-Dockerized"
                sh "git pull"
                sh "cd production"
                sh "echo '${ENV_VARS}' > .env"
                sh "docker-compose build"
            }
        }
        stage('Deploy') {
            steps {
                sh "echo 'Deploying....'"
                withCredentials([sshUserPrivateKey(credentialsId: MainSSHKey, keyFileVariable: 'KEY')]) {
                    sh "ssh -i ${KEY} mhwdvs.com -C \
                    \'git clone https://github.com/mhwdvs/GPUCompare-Dockerized.git && \
                    cd GPUComapre-Dockerized && \
                    git pull && \
                    cd production && \
                    echo '${ENV_VARS}' > .env && \
                    docker-compose build && \
                    docker-compose up\'"
                }
            }
        }
    }
}