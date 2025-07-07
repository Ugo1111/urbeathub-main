pipeline {
    agent any

    environment {
        TARGET_BRANCH = 'my-responsive-branch'
    }

    options {
        timeout(time: 20, unit: 'MINUTES')
    }

    stages {
        stage('Clone') {
            steps {
                echo "🔄 Cloning branch: ${env.TARGET_BRANCH}"
                bat 'git config --global http.postBuffer 524288000'
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: "*/${env.TARGET_BRANCH}"]],
                    userRemoteConfigs: [[url: 'https://github.com/Ugo1111/urbeathub-main.git']],
                    extensions: [[$class: 'CloneOption', shallow: false]]
                ])
            }
        }

        stage('Debug') {
            steps {
                echo "📁 Verifying test files in src/test..."
                bat 'dir src\\test /s'
            }
        }

        stage('Build') {
            steps {
                echo "⚙️ Installing dependencies..."
                bat 'node -v'
                bat 'npm install'
            }
        }

        stage('Test Single File') {
            steps {
                echo "🧪 Running single test file: Login.test.js..."
                bat 'npx jest src/test/Login.test.js --ci --runInBand'
            }
        }

        stage('Deploy') {
            when {
                expression { return false }
            }
            steps {
                echo "🚀 Skipping deploy stage (not implemented)."
            }
        }
    }

    post {
        always {
            echo "✅ Pipeline concluded."
            cleanWs()
        }
        success {
            echo "🎉 Build and test successful."
        }
        failure {
            echo "❌ Pipeline failed. Check logs for errors."
        }
    }
}
