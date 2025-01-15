# Comment exécuter le projet

J'ai utilisé le cluster distant MongoDB pour ma base de données, donc je n'ai pas installé MongoDB localement. J'ai ajouté l'adresse IP `0.0.0.0/0` aux paramètres réseau du cluster, ce qui permet à toute personne possédant la chaîne de connexion d'accéder à la base de données.  
Pour Redis, je l'ai installé sur un sous-système Ubuntu pour Windows, et il fonctionne bien sans aucun problème.

Pour exécuter le projet, vous devrez simplement installer les dépendances en utilisant la commande `npm install`, puis démarrer le serveur Redis sur le sous-système en utilisant la commande `redis-server` et enfin, utiliser la commande `npm start` pour lancer l'API sur le port 3000.

## Routes accessibles :

- **GET** -> `localhost:3000/api/courses/`  
  Cette route vous permettra d'obtenir tous les cours.

- **GET** -> `localhost:3000/api/courses/:id`  
  Cette route vous permettra d'obtenir un cours spécifique recherché par son `_id`.

- **GET** -> `localhost:3000/api/courses/stats`  
  Cette route vous fournira des statistiques sur le nombre de cours, la durée, etc.

- **DELETE** -> `localhost:3000/api/courses/:id`  
  Cette route permet de supprimer un cours en utilisant son id

- **PUT** -> `localhost:3000/api/courses/:id`  
  Cette route permet de modifier un cours en utilisant son id et l'objet json de modifications suivant la même structure d'objet de création (juste les attributs à modifiés)

- **POST** -> `localhost:3000/api/courses/`  
  Cette route permet d'ajouter un nouveau cours selon l'exemple suivant :

```json
{
  "title": "Base de données NOSQL",
  "description": "XML, MongoDB, Redis...",
  "instructor": "Prof DAAIF",
  "duration": 40,
  "location": "Amphi 4"
}
```

Les données doivent être envoyées sous forme d'objet JSON. Lors des tests avec Postman, allez dans l'onglet Body, sélectionnez raw et choisissez JSON pour respecter le format.

(Vous trouverez aussi le dossier "screenshots" où j'ai posté des captures des tests)

## Structure de Projet

src

- config

  - db.js # Configuration de la base de données
  - env.js # Variables d'environnement

- controllers

  - courseController.js # Contrôleur pour la gestion des cours

- routes

  - courseRoutes.js # Routes API pour les cours

- services

  - mongoService.js # Service MongoDB
  - redisService.js # Service Redis

- app.js # Point d'entrée de l'application

## Table des matières

1. [Pourquoi créer un module séparé pour les connexions aux bases de données ?](#pourquoi-créer-un-module-séparé-pour-les-connexions-aux-bases-de-données)
2. [Comment gérer proprement la fermeture des connexions ?](#comment-gérer-proprement-la-fermeture-des-connexions)
3. [Pourquoi est-il important de valider les variables d'environnement au démarrage ?](#pourquoi-est-il-important-de-valider-les-variables-denvironnement-au-démarrage)
4. [Que se passe-t-il si une variable requise est manquante ?](#que-se-passe-t-il-si-une-variable-requise-est-manquante)
5. [Quelle est la différence entre un contrôleur et une route ?](#quelle-est-la-différence-entre-un-contrôleur-et-une-route)
6. [Pourquoi séparer la logique métier des routes ?](#pourquoi-séparer-la-logique-métier-des-routes)
7. [Pourquoi séparer les routes dans différents fichiers ?](#pourquoi-séparer-les-routes-dans-différents-fichiers)
8. [Comment organiser les routes de manière cohérente ?](#comment-organiser-les-routes-de-manère-cohérente)
9. [Pourquoi créer des services séparés ?](#pourquoi-créer-des-services-séparés)
10. [Comment gérer efficacement le cache avec Redis ?](#comment-gérer-efficacement-le-cache-avec-redis)
11. [Quelles sont les bonnes pratiques pour les clés Redis ?](#quelles-sont-les-bonnes-pratiques-pour-les-clés-redis)
12. [Comment organiser le point d'entrée de l'application ?](#comment-organiser-le-point-dentrée-de-lapplication)
13. [Quelle est la meilleure façon de gérer le démarrage de l'application ?](#quelle-est-la-meilleure-façon-de-gérer-le-démarrage-de-lapplication)
14. [Quelles sont les informations sensibles à ne jamais commiter ?](#Quelles-sont-les-informations-sensibles-à-ne-jamais-commiter)
15. [Pourquoi utiliser des variables d'environnement ?](#Pourquoi-utiliser-des-variables-d'environnement)

---

## Pourquoi créer un module séparé pour les connexions aux bases de données ?

Séparer la connexion à la base de données dans un module distinct permet une meilleure réutilisation du code à travers l'application, facilite la maintenance en centralisant la configuration à un seul endroit, et améliore l'organisation du code en séparant clairement les responsabilités. Cette approche modulaire rend le code plus propre et plus facile à gérer.

## Comment gérer proprement la fermeture des connexions ?

Pour gérer proprement la fermeture des connexions, il faut s'assurer de fermer la connexion à la base de données lorsque l'application s'arrête. Cela se fait en écoutant les signaux de fermeture de l'application et en fermant proprement la connexion avant que le programme ne se termine.

## Pourquoi est-il important de valider les variables d'environnement au démarrage ?

La validation des variables d'environnement au démarrage est cruciale car elle permet de détecter immédiatement les erreurs de configuration avant que l'application ne démarre. Cela évite les crashs inattendus en production et aide à identifier rapidement les problèmes de configuration manquante ou incorrecte. C'est comme vérifier qu'on a toutes les clés nécessaires avant de partir en voyage.

## Que se passe-t-il si une variable requise est manquante ?

Si une variable d'environnement requise dans un fichier `.env` est manquante, le comportement dépend de la configuration de l'application. Si aucune vérification explicite n'est mise en place, l'application peut tenter d'utiliser une valeur par défaut, provoquer une erreur imprévue, ou fonctionner de manière incorrecte en raison de l'absence de la valeur attendue. Cependant, de bonnes pratiques consistent à valider les variables dès le démarrage de l'application, en générant une erreur claire (comme une exception) si une variable essentielle n'est pas définie, ce qui facilite le diagnostic et garantit un comportement prévisible.

## Quelle est la différence entre un contrôleur et une route ?

Une **route** est un point d'entrée qui mappe une URL et une méthode HTTP (GET, POST, etc.) à une action spécifique dans l'application, permettant de diriger les requêtes vers le bon endroit. Par exemple, une route `/users` avec GET peut afficher une liste d'utilisateurs. Un **contrôleur**, en revanche, est une composante logique qui contient les fonctions ou méthodes responsables de gérer la logique métier associée à ces routes. La route agit donc comme un guide pour diriger les requêtes vers le contrôleur, tandis que le contrôleur traite les données, interagit avec les modèles, et renvoie une réponse.

## Pourquoi séparer la logique métier des routes ?

Séparer la logique métier des routes permet de maintenir une architecture claire, modulaire et facile à maintenir. Les routes servent uniquement à diriger les requêtes entrantes vers les contrôleurs, qui eux contiennent la logique métier. Cette séparation améliore la lisibilité du code, facilite les tests unitaires, et rend le système plus flexible en cas de modifications ou d'ajout de fonctionnalités. En outre, elle suit les principes du développement structuré (comme MVC), ce qui favorise la collaboration en équipe, car les développeurs peuvent travailler indépendamment sur les différentes couches de l'application.

## Pourquoi séparer les routes dans différents fichiers ?

Séparer les routes dans différents fichiers améliore l'organisation et la lisibilité du code, surtout dans les grandes applications avec de nombreuses routes. Cela permet de regrouper les routes par fonctionnalité ou domaine (ex. : routes utilisateur, routes produit), ce qui rend le code plus facile à naviguer et à comprendre. En séparant les fichiers, il devient également plus simple de maintenir ou de modifier des routes spécifiques sans affecter les autres parties de l'application. Enfin, cela favorise la modularité et peut réduire les conflits lorsque plusieurs développeurs travaillent simultanément sur des fonctionnalités différentes.

## Comment organiser les routes de manière cohérente ?

Pour organiser les routes de manière cohérente, regroupez-les par fonctionnalité ou domaine (par exemple, `users.routes.js` pour les utilisateurs), et placez-les dans un répertoire dédié, comme `routes/`. Utilisez une convention de nommage uniforme et appliquez des préfixes d'URL (ex. : `/api/users`) pour chaque groupe de routes. Centralisez l’enregistrement des routes dans un fichier `index.js` pour simplifier leur gestion dans le serveur principal. Enfin, appliquez des middlewares spécifiques uniquement aux routes concernées pour garder le code clair et modulaire.

## Pourquoi créer des services séparés ?

Créer des services séparés permet de centraliser la logique métier et les interactions avec les données dans des modules réutilisables et indépendants des contrôleurs. Cela rend le code plus clair, modulaire et facile à maintenir, en réduisant le risque de duplication et en facilitant les tests unitaires. Les contrôleurs peuvent ainsi se concentrer sur la gestion des requêtes et des réponses, tandis que les services gèrent des tâches comme les calculs complexes, les interactions avec les bases de données ou les appels à des API externes. Cette séparation suit les principes de la responsabilité unique et améliore la scalabilité et la flexibilité de l'application.

## Comment gérer efficacement le cache avec Redis ?

Pour gérer efficacement le cache avec Redis, il est important de définir une stratégie de cache claire en sélectionnant les données les plus fréquemment consultées ou coûteuses à recalculer, et éviter de tout stocker dans Redis pour préserver la mémoire. Utilisez des clés explicites et bien nommées, par exemple en structurant les clés avec des namespaces (`user:123:profile`), afin d'éviter les conflits et de faciliter le débogage. Mettez en place des stratégies d'expiration adaptées aux données (TTL, ou time-to-live) pour garantir que le cache ne devienne pas obsolète, et surveillez l'utilisation de la mémoire avec des outils comme le LRU (Least Recently Used) pour éviter un dépassement de capacité. Enfin, pour des performances optimales, assurez-vous de gérer les erreurs Redis de manière robuste et d'implémenter un système de cache de remplacement ou de fallback si Redis devient indisponible.

## Quelles sont les bonnes pratiques pour les clés Redis ?

Les bonnes pratiques pour gérer les clés Redis incluent l'utilisation de clés explicites et descriptives, comme `user:123:profile`, pour faciliter la compréhension et la gestion des données. Il est important d'utiliser des préfixes (par exemple, `user:`, `session:`) afin de catégoriser les données et éviter les collisions de noms entre les différentes parties de l'application. Il est également recommandé de garder les clés concises et d'éviter les caractères spéciaux pour garantir la compatibilité. De plus, définir un TTL (time-to-live) pour les clés permet de limiter la durée de vie des données temporaires et de libérer de la mémoire automatiquement. Il faut également choisir les types de données Redis appropriés (strings, lists, sets, etc.) pour optimiser l'organisation et l'accès aux données, tout en gérant les expirations pour garantir que les données obsolètes ne restent pas dans le cache.

## Comment organiser le point d'entrée de l'application ?

Dans une application Express.js, l'organisation du point d'entrée est cruciale pour assurer une architecture propre et maintenable. Une bonne pratique consiste à structurer le point d'entrée dans un fichier principal, généralement appelé `app.js` ou `server.js`, qui initialise l'application et configure ses middleware, routes et autres composants essentiels. Ce fichier doit inclure l'importation des dépendances, la configuration des middlewares (comme le traitement des erreurs, la gestion des fichiers statiques, la validation des requêtes), et l'enregistrement des routes principales. Ensuite, les routes peuvent être organisées dans des fichiers séparés, en les divisant par fonctionnalité ou par domaine (par exemple, `users.routes.js`, `products.routes.js`). Pour faciliter la gestion des routes, vous pouvez créer un dossier `routes/` et les importer dans le fichier principal via un fichier `index.js` pour centraliser les points d'accès. Enfin, le fichier d’entrée doit gérer la connexion à la base de données, la gestion des erreurs globales et éventuellement démarrer le serveur, en écoutant sur un port spécifique. Cette approche modulaire garantit une organisation claire et une scalabilité à mesure que l'application évolue.

## Quelle est la meilleure façon de gérer le démarrage de l'application ?

La meilleure façon de gérer le démarrage d'une application Express.js consiste à séparer clairement l'initialisation et la configuration dans des modules distincts pour assurer un démarrage propre et évolutif. Le fichier principal, généralement appelé `server.js` ou `app.js`, doit se charger de l'importation des dépendances, de la configuration de l'application (middleware, routes, gestion des erreurs) et du démarrage du serveur en écoutant sur un port spécifié. Il est également recommandé de créer un fichier de configuration pour centraliser les paramètres comme les variables d'environnement, les ports, et d'autres paramètres spécifiques. Lors du démarrage, les connexions aux bases de données ou à des services externes doivent être établies de manière asynchrone pour s'assurer qu'elles sont prêtes avant de démarrer le serveur. Enfin, la gestion des erreurs globales doit être mise en place pour intercepter les erreurs non gérées et renvoyer des réponses appropriées, garantissant ainsi une robustesse accrue de l'application.

## Quelles sont les informations sensibles à ne jamais commiter ?

Les informations sensibles à ne jamais committer dans un dépôt Git incluent les clés API, mots de passe, informations de connexion (comme les identifiants de bases de données), fichiers de configuration contenant des données privées (comme `.env`), et tout autre secret ou donnée confidentielle. Ces informations doivent être protégées et ne jamais être exposées dans le code source. Utiliser un fichier `.gitignore` pour exclure ces fichiers et des outils de gestion des secrets, comme les variables d'environnement ou des services de gestion des secrets, est essentiel pour sécuriser les applications.

## Pourquoi utiliser des variables d'environnement ?

Les variables d'environnement permettent de séparer les configurations sensibles et spécifiques à l'environnement (comme les clés API, mots de passe, ou paramètres de connexion) du code source. Elles facilitent la gestion des configurations pour différents environnements (développement, test, production) sans modifier le code. Cela rend l'application plus flexible, sécurisée et portable, car les informations sensibles ne sont pas stockées dans le code source et peuvent être facilement mises à jour ou remplacées en fonction de l'environnement sans redéployer l'application.
