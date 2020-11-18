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
                withCredentials([sshUserPrivateKey(credentialsId: MainSSHKey, keyFileVariable: 'KEY')]) {
                    sh "ssh -i ${KEY} mhwdvs.com -C \'git clone && docker-compose build && docker-compose up\'"
                }
            }
        }
    }
}