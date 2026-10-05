window.portfolioContent = {
  email: 'hb.hamza.bst@gmail.com',
  resume: 'assets/Hamza_Boussetta_CV.pdf',
  linkedin: 'https://www.linkedin.com/in/hamza-boussetta-830155220/',
  projects: {
    minishell: {
      name: 'Minishell',
      category: 'UNIX SYSTEMS',
      tech: 'C · Processes · Parsing',
      description:
        'A Unix shell built in C, with command execution, built-ins, pipes, redirections, quoting and environment variable expansion.',
      url: 'https://github.com/hamzabsst/minishell',
    },
    inception: {
      name: 'Inception',
      category: 'INFRASTRUCTURE',
      tech: 'Docker · NGINX · MariaDB',
      description:
        'A WordPress stack built from custom Dockerfiles, with service isolation, persistent data, health checks and file-mounted secrets.',
      url: 'https://github.com/hamzabsst/inception',
    },
    push_swap: {
      name: 'push_swap',
      category: 'ALGORITHMS',
      tech: 'C · Linked lists · Cost models',
      description:
        'Sort integers with two stacks and a constrained instruction set. Includes input validation, small-stack strategies and a checker.',
      url: 'https://github.com/hamzabsst/push_swap',
    },
    philosophers: {
      name: 'philosophers',
      category: 'CONCURRENCY',
      tech: 'C · pthreads · Mutexes',
      description:
        'Coordinate philosophers competing for forks, with protected meal state, a monitor, and a process/semaphore bonus implementation.',
      url: 'https://github.com/hamzabsst/philosophers',
    },
    cub3d: {
      name: 'cub3D',
      category: 'GRAPHICS',
      tech: 'C · Raycasting · MiniLibX',
      description:
        'Render a textured first-person scene from a grid map using raycasting and DDA traversal.',
      url: 'https://github.com/hamzabsst/cub3D',
    },
    ft_irc: {
      name: 'ft_irc',
      category: 'NETWORKING',
      tech: 'C++98 · Sockets · Nonblocking I/O',
      description:
        'A multi-client IRC server with authentication, channels, messaging, operator commands and buffered nonblocking socket I/O.',
      url: 'https://github.com/hamzabsst/ft_irc',
    },
  },
  services: {
    nginx: {
      name: 'NGINX',
      details:
        'HTTPS 443 is published on the host. Shared wordpress volume: /var/www/html. Routes PHP requests to WordPress:9000.',
      snippet:
        'FROM debian:bullseye\n\nRUN apt-get update && apt-get install -y nginx openssl gettext-base \\\n\t&& rm -rf /var/lib/apt/lists/*\n\nCOPY conf/nginx.conf /etc/nginx/conf.d/default.conf.template\n\nCOPY conf/entrypoint.sh /usr/local/bin/\n\nRUN chmod +x /usr/local/bin/entrypoint.sh\n\nEXPOSE 443\n\nENTRYPOINT ["/usr/local/bin/entrypoint.sh"]\n',
      source:
        'https://github.com/hamzabsst/inception/blob/5ee80d35156185c80af89b87b6e144e2b7481f70/srcs/requirements/nginx/Dockerfile',
    },
    wordpress: {
      name: 'WordPress / PHP-FPM',
      details:
        'Port 9000 is internal. Volume: /var/www/html. Waits for healthy MariaDB and Redis; reads its granted password secrets.',
      snippet:
        'FROM debian:bullseye\n\nRUN apt-get update && apt-get install -y \\\n\tphp7.4-fpm \\\n\tphp7.4-mysql \\\n\tcurl \\\n\tdefault-mysql-client \\\n\t&& rm -rf /var/lib/apt/lists/*\n\nRUN curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar \\\n\t&& chmod +x wp-cli.phar \\\n\t&& mv wp-cli.phar /usr/local/bin/wp\n\nCOPY conf/www.conf /etc/php/7.4/fpm/pool.d/www.conf\nCOPY conf/entrypoint.sh /usr/local/bin/entrypoint.sh\nRUN chmod +x /usr/local/bin/entrypoint.sh\n\nWORKDIR /var/www/html\n\nEXPOSE 9000\n\nENTRYPOINT ["/usr/local/bin/entrypoint.sh"]\n',
      source:
        'https://github.com/hamzabsst/inception/blob/5ee80d35156185c80af89b87b6e144e2b7481f70/srcs/requirements/wordpress/Dockerfile',
    },
    mariadb: {
      name: 'MariaDB',
      details:
        'Port 3306 is internal. Volume: /var/lib/mysql. Receives database password files through /run/secrets; no database port is published to the host.',
      snippet:
        'FROM debian:bullseye\n\nRUN apt-get update && \\\n\tapt-get install -y mariadb-server && \\\n\trm -rf /var/lib/mysql/* && \\\n\trm -rf /var/lib/apt/lists/*\n\nCOPY conf/entrypoint.sh /usr/local/bin/\n\nRUN chmod +x /usr/local/bin/entrypoint.sh\n\nENTRYPOINT ["/usr/local/bin/entrypoint.sh"]\n\nEXPOSE 3306\n\nCMD ["mariadbd", "--user=mysql"]\n',
      source:
        'https://github.com/hamzabsst/inception/blob/5ee80d35156185c80af89b87b6e144e2b7481f70/srcs/requirements/mariadb/Dockerfile',
    },
  },
};
