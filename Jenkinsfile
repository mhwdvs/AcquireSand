pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                echo 'Building..'
                git pull
                docker-compose build
            }
        }
        stage('Test') {
            steps {
                echo 'Testing..'
            }
        }
        stage('Deploy') {
            steps {
                echo 'Deploying....'
                withCredentials([sshUserPrivateKey(credentialsId: MainSSHKey, keyFileVariable: 'KEY'), file(credentialsId: 'GPUCompare-Prod-Env', variable: 'ENV')]) {
                    sh "ssh -i ${KEY} mhwdvs.com -C \
                    \'git clone https://github.com/mhwdvs/GPUCompare-Dockerized.git && \
                    cd GPUComapre-Dockerized && \
                    git pull && \
                    cd production && \
                    echo '${ENV}' > .env && \
                    docker-compose build && \
                    docker-compose up\'"
                }
            }
        }
    }
}