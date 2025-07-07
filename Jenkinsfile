pipeline {
    agent any

    environment {
        // Git download tuning
        GIT_TRACE_PACKET = '1'
        GIT_TRACE = '1'
        GIT_CURL_VERBOSE = '1'
        GIT_HTTP_LOW_SPEED_LIMIT = '0'
        GIT_HTTP_LOW_SPEED_TIME = '999999'
        GIT_HTTP_MAX_REQUEST_BUFFER = '1000000000'
    }

    options {
        timeout(time: 20, unit: 'MINUTES') // Prevent hanging builds
    }

    stages {
        stage('Clone') {
            steps {
                echo "🔄 Cloning repository from branch: ${env.my-responsive-branch}"
                bat 'git config --global http.postBuffer 524288000'
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: "*/${env.my-responsive-branch}"]],
                    userRemoteConfigs: [[url: 'https://github.com/Ugo1111/urbeathub-main.git']],
                    extensions: [[$class: 'CloneOption', shallow: false]] // Full clone to ensure all files are present
                ])
            }
        }

        stage('Debug') {
            steps {
                echo "📁 Listing test files in src/tests..."
                bat 'dir src\\tests /s'
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
            cleanWs() // Clean workspace after every run
        }

        success {
            echo "🎉 Build and tests successful."
            // Optional: Add preview deployment or notification here
        }

        failure {
            echo "❌ Pipeline failed. Check logs for details."
        }
    }
}