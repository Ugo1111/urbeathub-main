pipeline {
    agent any

    environment {
        NODE_ENV = 'test'
    }

    options {
        timeout(time: 20, unit: 'MINUTES')
    }

    stages {
        stage('Checkout') {
            steps {
                echo '🔄 Cloning branch: my-responsive-branch'
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: '*/my-responsive-branch']],
                    userRemoteConfigs: [[url: 'https://github.com/Ugo1111/urbeathub-main.git']]
                ])
            }
        }

        stage('Debug') {
            steps {
                echo '📁 Verifying test files in src/test...'
                bat 'dir src\\test /s'
            }
        }

        stage('Build') {
            steps {
                echo '⚙️ Installing dependencies...'
                bat 'node -v'
                bat 'npm install'
            }
        }

        stage('Test All Files') {
            steps {
                echo '🧪 Running all test files in src/test/...'
                bat '''
                    npx jest src/test/Login.test.js ^
                             src/test/AuthState.test.js ^
                             src/test/Front.test.js ^
                             src/test/SellBeatSection.test.js ^
                             src/test/UsersUploadMusicPage.test.js ^
                             src/test/PaystackPayment.test.js ^
                             src/test/SongList.test.js ^
                             src/test/MusicPlayer.test.js ^
                             --ci --runInBand
                '''
            }
        }

        stage('Deploy') {
            when {
                expression { return false } // Skipping deploy for now
            }
            steps {
                echo '🚀 Deployment step (currently skipped)'
            }
        }
    }

    post {
        always {
            echo '✅ Pipeline concluded.'
            cleanWs()
        }

        success {
            echo '🎉 Build and test successful.'
        }

        failure {
            echo '❌ Build or test failed.'
        }
    }
}
