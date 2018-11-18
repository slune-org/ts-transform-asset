# ts-transform-asset - Transformateur typescript pour l'import des fichiers annexes

## Objectif

Ce transformateur se content de convertir les imports tel que :

```typescript
import * as foo from "../images/bar.png";
```

en :

```typescript
const foo = "assets/bar.png";
```

## Mais pourquoi aurai-je besoin de ça ?

Imaginez que vous avez un projet qui crée des pages web. Ce projet est empaqueté avec `Webpack`, qui génère un `bundle.js`. Durant ce processus, l'extension `file-loader` de `Webpack` déplace les fichiers annexes dans le répertoire de destination. Ceci est fait en indiquant des `import * as foo from '../images/bar.png` pour ces fichiers annexes dans le code source.

Imaginez maintenant que vous avez un autre projet qui contient le serveur web. Ce serveur, qui dépend du projet précédent, prendra tous ces fichiers annexes ainsi que le paquet `bundle.js` pour servir les clients. Mais vous voulez également faire du rendu côté serveur. Pour cela, vous préférez utiliser la version transpilée avec les fichiers `javascript` et de définition plutôt que le paquet minimisé et sans type. Sauf que cela ne fonctionne pas car le serveur ne sait pas quoi faire des imports définis dans les pages web.

L'utilisation de ce transformateur pour transpiler les pages web (pas pour `Webpack` !) convertira ces imports en constantes contenant l'URL où les ressources peuvent être trouvées, et les projets dépendants fonctionneront sans plus de configuration.

# Installation

L'installation se fait avec la commande `npm install` :

```bash
$ npm install --save-dev ts-transform-asset
```

Si vous préférez utiliser `yarn` :

```bash
$ yarn add --dev ts-transform-asset
```

# Langue

Le français étant ma langue maternelle, fournir les documents et messages en français n'est pas une option. Les autres traductions sont bienvenues.

Cependant, l'anglais étant la langue de la programmation, le code, y compris les noms de variable et commentaires, sont en anglais.

# Utilisation

Le transformateur accepte les paramètres suivants :

- `assetsMatch`: une expression rationnelle utilisée pour sélectionner les imports de fichiers annexes, par exemple, pour tous les fichiers `.png`, `assetsMatch = "\\.png$"` — ce paramètre est obligatoire;
- `targetPath`: un chemin qui est préfixé au nom de fichier, c'est le `publicPath` que vous pouvez avoir défini dans le paramètre `output` de `Webpack` — ce paramètre est optionnel.

Il n'y a actuellement pas moyen de déclarer un transformateur dans le compilateur `typescript` standard. Si vous ne souhaitez pas écrire votre propre compilateur en utilisant l'API `typescript`, vous pouvez utiliser la surcouche `ttypescript`. Les explications sont données ci-dessous.

## Installation

Tout d'abord, il faut installer `ttypescript`, soit avec `npm`:

```bash
$ npm install --save-dev ttypescript
```

soit avec `yarn`:

```bash
$ yarn add --dev ttypescript
```

## Configuration

Ensuite, configurez votre `tsconfig.json`

```json
{
  "compilerOptions": {
    "plugins": [
      {
        "transform": "ts-transform-asset",
        "type": "config",
        "assetsMatch": "\\.png$",
        "targetPath": "assets"
      }
    ]
  }
}
```
