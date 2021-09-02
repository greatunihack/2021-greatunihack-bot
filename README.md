# GreatUniHack 2021

!["License"](https://img.shields.io/github/license/greatunihack/2021-greatunihack)
!["Repository Size"](https://img.shields.io/github/repo-size/greatunihack/2021-greatunihack)
!["Vulnerabilities"](https://img.shields.io/snyk/vulnerabilities/github/greatunihack/2021-greatunihack)
!["Version"](https://img.shields.io/github/package-json/v/greatunihack/2021-greatunihack)

The online platform for GreatUniHack 2021, allowing participants to sign up to the hackathon, create or join a team, view sponsors & challenges, and submit their projects.

## Getting Started

These instructions will get the hackathon platform up and running on your local machine.

### Prerequisites

You need `node` and `npm` installed globally on your machine. You will also need to make a [Firebase](https://firebase.google.com/) account.

### Installing

**Cloning the repository:**

```cmd
git clone https://github.com/greatunihack/2021-greatunihack-bot.git
cd 2021-greatunihack-bot
```

---

**Environment variables:**

Duplicate the `.env.example` file to create a `.env` file.

Windows

```cmd
copy .env.example .env
```

MacOS/Linux

```bash
cp .env.example .env
```

Replace the placeholder values with the credentials for your Discord bot.

---

**Installation:**

```cmd
npm install
```

---

**Starting the project:**

```cmd
npm start
```

---

**Generating API documentation:**

```cmd
npm run docs
```

This will generate a `docs` directory. You should open `index.html` from this directory to access the documentation.

---

## Contributors

- [Sam Hirst](https://github.com/Naeviant)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for more details.
