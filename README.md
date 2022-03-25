# ApplicationWeb
Application web permettant le contrôle du robot à distance et la visualisation des données de l'ISTR. Son fonctionnement est étroitement lié à sa partie **Serveur** qui se retrouve au répertoire *GitHub* suivant: https://github.com/MEC8370-14-Robot-LESIAQ/Serveur

## Implémentation

L'application a été développée avec le *framework* **Ionic-React** qui permet une compatibilité *cross-platform* et de profiter des comportements natifs des appareils mobiles sur le Web.

- Ionic: https://ionicframework.com/
- React: https://reactjs.org/

L'application fait également usage de la librairie **AR.js** (https://ar-js-org.github.io/AR.js-Docs/#arjs-augmented-reality-on-the-web) pour sa composante de réalité augmentée.

## Configuration des appareils mobiles

Pour accéder à l'application, il faut d'abord s'assurer d'être connecter au sous-réseau 132.207.84.X du LESIAQ. Par le suite, dans le navigateur web disponible sur l'appareil, il faut entrer l'adresse <https://132.207.84.26:8000> dans la barre de navigation. Autorisez l'accès au site sous l'onglet "advanced". Pour l'instant, l'application peut être utilisée sur les navigateurs suivants: Chrome (v4+), Safari (v11+) et Internet Explorer (v10+).

### IOS (Safari)

L'application utilise un lien **WebSocket** pour l'échange de données en continue avec le serveur. Le navigateur web Safari empêche l'ouverture du lien WebSocket sous un certificat SSL auto signé. Pour autoriser la session, il faut aller dans **settings > Safari > advanced > Experimental Feature** puis activer le **NSURLSession WebSocket**.

### Firefox (Incompatible pour l'instant)

Comme pour Safari, le navigateur Firefox empêche l'ouverture du lien webSocket. À ce jour, aucun "work around" a été trouvé pour remédier à ce problème. Il est alors impossible de profiter de l'entièreté des fonctionnalités de l'application sur Firefox.

## Organisation des fichiers

1. **./public** : Comporte les fichiers statiques de l'application en accès publique
    1. *index.html* : point d'entrée Web de l'application 
    2. *manifest.json* : contient l'information générale sur l'application
    3.  */assets* : contient la scene de réalité augmentée et les icons
 
2. **./src** : Comporte les fichiers sources de l'application à compiler
    1. */components* : contient les composantes de l'application (*Login*, *Menu*, *Header*) - Typescript + CSS
    2. */pages* : contient toutes les pages de l'application (*Input Window*, *Data Window - ISTR*, *Data Window - Robot*, *AR Window*) - Typescript + CSS
    3. */scripts* : contient les documents implémentés en javascript

## Tester l'application pendant l'édition du code 

- Installez la version stable la plus récente de Node.js :  https://nodejs.org/en/
- Après installation, ouvrez le terminal de commandes au "root" du répertoire Git
- Installez les modules nécessaires avec l'entrée suivante: npm-script 
- Assurez-vous de changer la valeur de la variable **auth** à 0 ou 1 pour passer l'étape d'authentification
- Ensuite, toujours dans le terminal, démarrer l'application avec la commande: ionic serve

## Builder l'application

- Assurez-vous de remettre la valeur de la variable **auth** à -1 et d'avoir suivi toutes les étapes d'installation montrées à la section précédente
- Ouvrez le terminal de commandes au "root" du répertoire Git puis tapez la commande suivante: ionic build
- Les fichiers statiques se retrouvent dans le sous-répertoire **Build**
