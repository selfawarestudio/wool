DEPRECATED! Wool is no longer maintained becuase Tailwind JIT won us over 🙃

# WOOL

🐑 A comprehensive and flexible utility-first styling solution.

## Features

- ✨ Concise classnames
- 🏛️ Built with sass
- 🎨 Easy to customize
- 💕 Responsive

## Installation
1. Install it
```
npm i @selfaware/wool
```
2. Import it
```
@import '@selfaware/wool/src/index.scss';
```

## Customization
To customize the CSS output of wool, import a custom configuration file including your desired overrides before the main wool import we added before.
```
@import 'my-config';
@import '@selfaware/wool/src/index.scss';
```

A great way to get started with customization is to reference the [default configuration file](https://github.com/selfawarestudio/wool/blob/master/src/_config.scss) to learn which settings are available.

## Motivation

At [Self Aware](https://selfaware.studio), utility-first has been by far the most efficient and maintainable styling methodology. We used to use BEM for everything, but naming things sucks, and we felt the pains of our premature abstractions too many times to continue down that road. We still use BEM on those rare occasions where we need just a little bit more control than wool can offer (i.e. a complex hover effect or hamburger menu interaction). I could go on and on about the benefits, but you should probably just read [this article](https://frontstuff.io/in-defense-of-utility-first-css) about utility-first, because it's really good and also framework agnostic.

We built wool because we got tired of copying and pasting our accumulation of custom utility classes between codebases — tweaking colors, typography, and other project-specific settings by hand every time.
