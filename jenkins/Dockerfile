ARG K6_VERSION=1.0.0
FROM grafana/k6:${K6_VERSION} AS k6

# Só o cliente Docker: os comandos do pipeline são executados pelo Docker do host, pelo socket montado no compose.
FROM docker:29.7.2-cli AS docker

FROM jenkins/jenkins:lts-jdk21

USER root

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        curl ca-certificates \
        xauth xvfb libgtk2.0-0 libgtk-3-0 libgbm-dev libnotify-dev \
        libnss3 libxss1 libasound2 libxtst6 \
    && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

COPY --from=k6 /usr/bin/k6 /usr/bin/k6
COPY --from=docker /usr/local/bin/docker /usr/local/bin/docker
# compose sobe o stack de teste; buildx é usado pelo compose para construir as imagens.
COPY --from=docker /usr/local/libexec/docker/cli-plugins/docker-compose /usr/local/libexec/docker/cli-plugins/docker-compose
COPY --from=docker /usr/local/libexec/docker/cli-plugins/docker-buildx /usr/local/libexec/docker/cli-plugins/docker-buildx

ENV JAVA_OPTS="-Djenkins.install.runSetupWizard=false"
ENV CASC_JENKINS_CONFIG=/usr/share/jenkins/casc.yaml

USER jenkins

COPY --chown=jenkins:jenkins plugins.txt /usr/share/jenkins/ref/plugins.txt
RUN jenkins-plugin-cli --plugin-file /usr/share/jenkins/ref/plugins.txt

COPY --chown=jenkins:jenkins casc.yaml /usr/share/jenkins/casc.yaml