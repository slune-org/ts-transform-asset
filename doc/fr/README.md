# ts-transform-asset - Transformateur typescript pour l'import des fichiers annexes

Ce transformateur se contente de convertir les imports tel que :

```typescript
import foo from './images/foo.gif'
import * as bar from '../images/bar.png'
export { default } from './foobar.svg'
export { default as foobar } from './foobar.ico'
```

en :

```typescript
const foo = 'assets/foo.gif'
const bar = 'assets/bar.png'
const foobar_svg_1 = 'assets/foobar.svg'
export default foobar_svg_1
export const foobar = 'assets/foobar.ico'
```

# Langue

Le français étant ma langue maternelle, fournir les documents et messages en français est obligatoire. Les autres traductions sont bienvenues.

Cependant, l'anglais étant la langue de la programmation, le code, y compris les noms de variable et commentaires, sont en anglais.

# Installation

L'installation se fait avec la commande `npm install` :

```bash
$ npm install --save-dev ts-transform-asset
```

Si vous préférez utiliser `yarn` :

```bash
$ yarn add --dev ts-transform-asset
```

# Pourquoi aurai-je besoin de ça ?

Vous avez un projet empaqueté avec `Webpack` et l'extension `file-loader`. Lorsque cette extension trouve un `import foo from "./images/foo.gif"`, elle copie `foo.gif` vers un répertoire de fichiers annexes et modifie l'utilisation de `foo` en utilisant le chemin public vers le fichier. Bien.

Maintenant, vous avez un autre projet qui contient le serveur web. Ce serveur, qui dépend du projet précédent, prendra le paquet généré et tous ces fichiers annexes pour les servir aux clients. Mais vous voulez également faire du rendu côté serveur (SSR). Et pour cela, vous ne pouvez pas utiliser le paquet généré par `Webpack` parce qu'il n'a pas un point d'entré approprié pour le serveur (il utilise un `BrowserRouter` au lieu d'un `StaticRouter`, par exemple). Ou peut-être préférez-vous utiliser la version transpilée avec les fichiers `javascript` et les fichiers de définition plutôt que le paquet minimisé et sans type.

Malheureusement, cela ne fonctionne pas car le serveur ne sait pas quoi faire des imports de fichiers annexes.

L'utilisation de ce transformateur pour transpiler les pages web (pas pour `Webpack` !) convertira ces imports en constantes contenant l'URL où les ressources peuvent être trouvées, et les projets dépendants fonctionneront sans plus de configuration.

# Utilisation

Le transformateur accepte les paramètres suivants :

- `assetsMatch`: une expression rationnelle utilisée pour sélectionner les imports de fichiers annexes, par exemple, pour tous les fichiers `.png`, `assetsMatch = "\\.png$"` — ce paramètre est obligatoire;
- `targetName`: un patron similaire au [Webpack file-loader name](https://webpack.js.org/loaders/file-loader/#name) utilisé pour convertir le nom du fichier annexe — si vous définissez un `publicPath` dans le paramètre `output` de `Webpack`, vous aurez probablement besoin de spécifier ce chemin ici également — ce paramètre est optionnel et vaut `[hash].[ext]` par défaut.

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
        "assetsMatch": "\\.png$",
        "targetName": "assets/[name]-[hash].[ext]"
      }
    ]
  }
}
```

## Code source

Votre code source TypeScript devrait déjà être correctement écrit si vous utilisez `Webpack` et le `file-loader`. Dans le cas contraire, vous pouvez suivre les instructions ci-dessous.

### Déclaration des modules

Avant de pouvoir les utiliser, vous devez déclarer les nouveaux types de modules, dans un fichier `assets.d.ts`, par exemple :

```typescript
declare module '*.png' {
  const content: string
  export default content
}
```

Les anciennes versions de `file-loader` (avant la 5.0.2) n'utilisaient pas d'export par défaut. Les types de modules doivent plutôt être déclarés ainsi dans ce cas :

```typescript
declare module '*.png' {
  const content: string
  export = content
}
```

### Import des fichiers annexes

Lorsque le fichier (module) doit être utilisé :

```typescript
import image from './image.png'

const url: string = image
```

Il est également possible de ré-exporter les fichiers annexes :

```typescript
export { default as image } from './image.png'
```

Puis, dans un autre fichier :

```typescript
import { image } from '../images'

const url: string = image
```

Pour les anciennes versions de `file-loader` (avant la 5.0.2), seul l'import d'espace de nom est possible :

```typescript
import * as image from './image.png'

const url: string = image
```

# Notes

- Le transformateur ne détectera ni ne modifiera aucune instruction `require`. Il est conseillé de l'exécuter dans la phase de compilation `before`, avant que le code soit convertit dans une version plus ancienne d'`ECMAScript`.
- Le transformateur modifie le code s'il est conforme à ce qui est attendu, ou ne le touche pas du tout. Il y a toutefois une exception pour les déclarations de ré-exports : si le module source correspond aux paramètres donnés mais que la propriété exportée n'est pas `default`, alors cet propriété sera supprimée.
- Merci d'ouvrir un incident si vous avez un problème à l'utilisation de ce transformateur. Même si je ne peux pas garantir de délai de réponse, je ferai de mon mieux pour corriger les problèmes et répondre aux questions.
- Les contributions sont bien sûr bienvenues.

# Migration

## Versions antérieures à 3.x.x

Avant la version 3.x.x, il y avait une entrée de configuration nommée `targetPath` qui définissait un chemin préfixé au nom de fichier. Tout est maintenant défini par la nouvelle entrée `targetName`. La conversion d'une ancienne configuration vers la nouvelle est aussi simple que l'exemple ci-dessous :

```diff
       "transform": "ts-transform-asset",
       "assetsMatch": "\\.png$",
-      "targetPath": "assets"
+      "targetName": "assets/[name].[ext]"
     }
   ]
```

## Versions antérieur à 2.x.x

En plus des modifications précédentes, notez qu'avant la version 2.x.x, le transformateur était de type `config`. Depuis la version 2.0.0, le transformateur est de type `program`, qui est le type par défaut. Si vous mettez à jour depuis une version plus ancienne et que vous utilisez `ttypescript`, vous devrez mettre à jour la configuration du `plugin` dans `tsconfig.json` :

```diff
     {
       "transform": "ts-transform-asset",
-      "type": "config",
       "assetsMatch": "\\.png$",
       "targetName": "assets/[name].[ext]"
```
