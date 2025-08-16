# 🚀 Qweb - An AI-powered sustainable search engine that pays websites per crawl 🔎

<div align="center" markdown="1">


![preview](.assets/qweb-screenshot.png?)

## Table of Contents <!-- omit in toc -->

- [Overview](#overview)
- [Preview](#preview)
- [Features](#features)
- [Installation](#installation)
  - [Ollama Connection Errors](#ollama-connection-errors)
- [Using as a Search Engine](#using-as-a-search-engine)
- [Using Qweb's API](#using-Qwebs-api)
- [Expose Qweb to a network](#expose-Qweb-to-network)
- [Upcoming Features](#upcoming-features)

## Overview

Qweb is an open-source AI-powered searching tool or an AI-powered search engine that goes deep into the internet to find answers. Inspired by Perplexity AI, it's an open-source option that not just searches the web but understands your questions. It uses advanced machine learning algorithms like similarity searching and embeddings to refine results and provides clear answers with sources cited.

Using SearxNG to stay current and fully open source, Qweb ensures you always get the most up-to-date information without compromising your privacy.

Want to know more about its architecture and how it works? You can read it [here](https://github.com/qweb-project/qweb/tree/master/docs/architecture/README.md).

## Preview

![video-preview](.assets/Qweb-preview.gif)

## Features

- **Local LLMs**: You can make use local LLMs such as Llama3 and Mixtral using Ollama.
- **Two Main Modes:**
  - **Copilot Mode:** (In development) Boosts search by generating different queries to find more relevant internet sources. Like normal search instead of just using the context by SearxNG, it visits the top matches and tries to find relevant sources to the user's query directly from the page.
  - **Normal Mode:** Processes your query and performs a web search.
- **Focus Modes:** Special modes to better answer specific types of questions. Qweb currently has 6 focus modes:
  - **All Mode:** Searches the entire web to find the best results.
  - **Writing Assistant Mode:** Helpful for writing tasks that do not require searching the web.
  - **Academic Search Mode:** Finds articles and papers, ideal for academic research.
  - **YouTube Search Mode:** Finds YouTube videos based on the search query.
  - **Wolfram Alpha Search Mode:** Answers queries that need calculations or data analysis using Wolfram Alpha.
  - **Reddit Search Mode:** Searches Reddit for discussions and opinions related to the query.
- **Current Information:** Some search tools might give you outdated info because they use data from crawling bots and convert them into embeddings and store them in a index. Unlike them, Qweb uses SearxNG, a metasearch engine to get the results and rerank and get the most relevant source out of it, ensuring you always get the latest information without the overhead of daily data updates.
- **API**: Integrate Qweb into your existing applications and make use of its capibilities.

It has many more features like image and video search. Some of the planned features are mentioned in [upcoming features](#upcoming-features).

## Installation

You can run qweb locally with npm

### Getting Started 

1. Install SearXNG and allow `JSON` format in the SearXNG settings.
2. Clone the repository 
   ```bash
   git clone https://github.com/qweb-project/qweb.git
   ```
3. rename the `sample.config.toml` file to `config.toml` in the root directory. Ensure you complete all required fields in this file.

   - `OPENAI`: Your OpenAI API key. **You only need to fill this if you wish to use OpenAI's models**.
   - `OLLAMA`: Your Ollama API URL. You should enter it as `http://host.docker.internal:PORT_NUMBER` if you use docker or just `http://localhost:PORT_NUMBER` . If you installed Ollama on port 11434, use `http://host.docker.internal:11434` in docker. For other ports, adjust accordingly. **You need to fill this if you wish to use Ollama's models instead of OpenAI's**.
   - `GROQ`: Your Groq API key. **You only need to fill this if you wish to use Groq's hosted models**.
   - `ANTHROPIC`: Your Anthropic API key. **You only need to fill this if you wish to use Anthropic models**.
   - `Gemini`: Your Gemini API key. **You only need to fill this if you wish to use Google's models**.
   - `DEEPSEEK`: Your Deepseek API key. **Only needed if you want Deepseek models.**
   - `AIMLAPI`: Your AI/ML API key. **Only needed if you want to use AI/ML API models and embeddings.**

     **Note**: You can change these after starting Qweb from the settings dialog.

   - `SIMILARITY_MEASURE`: The similarity measure to use (This is filled by default; you can leave it as is if you are unsure about it.)

3. After populating the configuration run `npm i`.
4. Install the dependencies and then execute `npm run build`.
5. Finally, start the app by running `npm run start`

See the [installation documentation](https://github.com/qweb-project/qweb/tree/master/docs/installation) for more information like updating, etc.

### Ollama Connection Errors

If you're encountering an Ollama connection error, it is likely due to the backend being unable to connect to Ollama's API. To fix this issue you can:

1. **Check your Ollama API URL:** Ensure that the API URL is correctly set in the settings menu.
2. **Update API URL Based on OS:**

   - **Windows:** Use `http://localhost:11434` (http://host.docker.internal:11434 in docker)
   - **Mac:** Use `http://localhost:11434` (http://host.docker.internal:11434 in docker)
   - **Linux:** Use `http://<private_ip_of_host>:11434`

   Adjust the port number if you're using a different one.

3. **Linux Users - Expose Ollama to Network:**

   - Inside `/etc/systemd/system/ollama.service`, you need to add `Environment="OLLAMA_HOST=0.0.0.0:11434"`. (Change the port number if you are using a different one.) Then reload the systemd manager configuration with `systemctl daemon-reload`, and restart Ollama by `systemctl restart ollama`. For more information see [Ollama docs](https://github.com/ollama/ollama/blob/main/docs/faq.md#setting-environment-variables-on-linux)

   - Ensure that the port (default is 11434) is not blocked by your firewall.

## Using as a Search Engine

If you wish to use Qweb as an alternative to traditional search engines like Google or Bing, or if you want to add a shortcut for quick access from your browser's search bar, follow these steps:

1. Open your browser's settings.
2. Navigate to the 'Search Engines' section.
3. Add a new site search with the following URL: `http://localhost:3000/?q=%s`. Replace `localhost` with your IP address or domain name, and `3000` with the port number if Qweb is not hosted locally.
4. Click the add button. Now, you can use Qweb directly from your browser's search bar.

## Using Qweb's API

Qweb also provides an API for developers looking to integrate its powerful search engine into their own applications. You can run searches, use multiple models and get answers to your queries.

For more details, check out the full documentation [here](https://github.com/qweb-project/qweb/tree/master/docs/API/SEARCH.md).

## Expose Qweb to network

Qweb runs on Next.js and handles all API requests. It works right away on the same network and stays accessible even with port forwarding.

## Upcoming Features

- [x] Add settings page
- [x] Adding support for local LLMs
- [x] History Saving features
- [x] Introducing various Focus Modes
- [x] Adding API support
- [x] Adding Discover
- [ ] Finalizing Copilot Mode

