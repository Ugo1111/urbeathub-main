pipeline {
    agent any

    environment {
        TARGET_BRANCH = 'main'
    }

    stages {
        stage('Setup Git Config') {
            steps {
                bat 'git config --global http.postBuffer 524288000'
                bat 'git config --global http.maxRequestBuffer 1000000000'
            }
        }

        stage('Clone Repository') {
            steps {
                retry(3) {
                    checkout([
                        $class: 'GitSCM',
                        branches: [[name: "*/${env.TARGET_BRANCH}"]],
                        userRemoteConfigs: [[
                            url: 'git@github.com:Ugo1111/urbeathub-main.git',
                            credentialsId: 'github-ssh'
                        ]],
                        extensions: [[$class: 'CloneOption', shallow: false]]
                    ])
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'npm install'
            }
        }

        stage('Run Tests') {
            steps {
                bat 'npm test -- --watchAll=false'
            }
        }
    }

    post {
        always {
            echo '✅ Pipeline concluded.'
            cleanWs()
        }
        success {
            echo '✅ Build and tests succeeded!'
        }
        failure {
            echo '❌ Build or tests failed. Check logs for details.'
        }
    }
}
