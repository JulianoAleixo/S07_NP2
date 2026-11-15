pipeline {
    agent any

    options {
        timestamps()
        timeout(time: 30, unit: 'MINUTES')
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10', artifactNumToKeepStr: '5'))
    }

    parameters {
        booleanParam(
            name: 'RUN_K6',
            defaultValue: false,
            description: 'Executar também o teste de carga (k6)'
        )
    }

    // "app" e "api" são serviços do docker-compose.yaml, alcançados pelo nome na rede interna.
    environment {
        CYPRESS_BASE_URL = 'http://app'
        TARGET_URL       = 'http://app/'
        CI               = 'true'
    }

    stages {

        stage('Validar ambiente') {
            steps {
                sh '''
                    node --version
                    npm --version
                    k6 version
                '''
            }
        }

        stage('Instalar dependências') {
            steps {
                dir('api')   { sh 'npm ci' }
                dir('app')   { sh 'npm ci' }
                dir('tests') { sh 'npm ci' }
            }
        }

        stage('Testes unitários') {
            parallel {
                stage('API') {
                    steps { dir('api') { sh 'npm test' } }
                }
                stage('App') {
                    steps { dir('app') { sh 'npm test' } }
                }
            }
        }

        stage('Testes E2E (Cypress)') {
            steps {
                sh 'rm -rf tests/cypress/reports tests/cypress/screenshots tests/cypress/videos'
                sh 'curl -fsS --retry 5 --retry-delay 2 --retry-all-errors http://app/api/health'
                dir('tests') { sh 'npx cypress run' }
            }
        }

        stage('Performance (k6)') {
            when { expression { params.RUN_K6 } }
            steps {
                dir('tests') { sh 'k6 run Performance/scripts/homepage-load.test.ts' }
            }
        }

        stage('Build e empacotamento') {
            steps {
                sh '''
                    (cd api && npm run build)
                    (cd app && npm run build)
                    rm -rf artifacts
                    mkdir -p artifacts
                    tar -czf artifacts/s07-np2-${BUILD_NUMBER}.tar.gz \
                        app/dist api/dist api/package.json api/package-lock.json
                '''
            }
        }
    }

    post {
        always {
            archiveArtifacts(
                artifacts: 'artifacts/*.tar.gz, tests/cypress/reports/**, tests/cypress/screenshots/**, tests/Performance/reports/**, api/coverage/**, app/coverage/**, api/reports/**, app/reports/**',
                allowEmptyArchive: true,
                fingerprint: true
            )
            junit allowEmptyResults: true, testResults: 'api/reports/junit.xml, app/reports/junit.xml'

            // Roda depois do arquivamento, para o link do e-mail já mostrar os artefatos.
            // returnStatus evita que uma falha no envio mude o resultado real do build.
            // O pacote não vai anexado: o Gmail bloqueia compactados com .js. Ele fica nos artefatos, pelo link.
            withEnv(["BUILD_STATUS=${currentBuild.currentResult}"]) {
                script {
                    def code = sh(returnStatus: true, script: '''
                        (cd scripts/notify && npm ci) &&
                        node scripts/notify/send-email.js \
                            tests/cypress/reports/index.html
                    ''')
                    if (code != 0) {
                        echo "Falha ao enviar o e-mail de notificação (código ${code})"
                    }
                }
            }
        }
    }
}