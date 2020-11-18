pipeline {
    agent any

    environment{
        ENV_VARS = credentials('GPUCompare-Prod-Env')
    }

    stages {
        stage('Build') {
            steps {
                sh "echo 'Building..'"
                catchError(buildResult: 'SUCCESS', stageResult: 'SUCCESS'){
                    sh "git clone https://github.com/mhwdvs/GPUCompare-Dockerized.git"
                }
                sh "cd GPUCompare-Dockerized"
                sh "git switch main"
                sh "git pull"
                dir("production"){
                    sh "cp -f '${ENV_VARS}' .env"
                    sh "docker-compose build"
                }
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
                    docker-compose up -d\'"
                }
            }
        }
    }
}