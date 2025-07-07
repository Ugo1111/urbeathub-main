pipeline {
    agent any

    environment {
        // Git tuning for large repos or slow networks
        GIT_TRACE_PACKET = '1'
        GIT_TRACE = '1'
        GIT_CURL_VERBOSE = '1'
        GIT_HTTP_LOW_SPEED_LIMIT = '0'
        GIT_HTTP_LOW_SPEED_TIME = '999999'
        GIT_HTTP_MAX_REQUEST_BUFFER = '1000000000'
        TARGET_BRANCH = 'my-responsive-branch'
    }

    options {
        timeout(time: 20, unit: 'MINUTES') // Prevent hanging builds
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

        stage('Test') {
            steps {
                echo "🧪 Running test suite..."
                bat 'npm test -- --ci --passWithNoTests'
            }
        }

        stage('Deploy') {
            when {
                expression { return false } // Skip deploy for now
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
            echo "🎉 Build and tests successful."
        }

        failure {
            echo "❌ Pipeline failed. Check logs for details."
        }
    }
}