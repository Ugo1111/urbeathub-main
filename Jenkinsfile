pipeline {
    agent any

    environment {
        // Git download tuning for large repos or slow networks
        GIT_TRACE_PACKET = '1'
        GIT_TRACE = '1'
        GIT_CURL_VERBOSE = '1'
        GIT_HTTP_LOW_SPEED_LIMIT = '0'
        GIT_HTTP_LOW_SPEED_TIME = '999999'
        GIT_HTTP_MAX_REQUEST_BUFFER = '1000000000'
    }

    options {
        // Prevent pipeline from hanging indefinitely
        timeout(time: 20, unit: 'MINUTES')
    }

    stages {
        stage('Clone') {
            steps {
                echo "🔄 Cloning repository (shallow)..."
                bat 'git config --global http.postBuffer 524288000'
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: '*/main']],
                    userRemoteConfigs: [[url: 'https://github.com/Ugo1111/urbeathub-main.git']],
                    extensions: [[$class: 'CloneOption', shallow: true, depth: 1]]
                ])
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
                bat 'npm test -- --ci'
            }
        }

        stage('Deploy') {
            when {
                expression { return false } // Skip deploy for now or replace with a real condition
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
            // Optional: Replace with real deployment or preview logic
            // bat 'start npm start'
        }

        failure {
            echo "❌ Pipeline failed. Check logs for details."
        }
    }
}