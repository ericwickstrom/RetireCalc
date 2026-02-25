# RetireCalc

A retirement planning calculator that uses Monte Carlo simulations to model portfolio outcomes under market uncertainty. Supports couples planning with tax-aware withdrawal strategies.

**Live demo:** [ericwickstrom.github.io/RetireCalc](https://ericwickstrom.github.io/RetireCalc/)

## Features

- **Monte Carlo Simulation** - Runs 10,000 market scenarios using historical stock/bond return distributions to estimate retirement success probability
- **Tax-Aware Withdrawals** - Optimizes withdrawal order across account types (HSA, Roth, Brokerage, Traditional) to minimize lifetime taxes
- **Couples Planning** - Models two people with independent Social Security, pensions, and retirement accounts
- **Semi-Retirement** - Optional partial-retirement phase with reduced income and savings
- **2026 Federal Tax Brackets** - Includes income tax, capital gains, standard deduction, and Required Minimum Distributions (age 73+)
- **Social Security Modeling** - Adjusts benefits by claim age (70% at 62, 124% at 70)
- **Plan Scoring** - Composite score (0-100) based on simulation success rate and the 25x rule

## Tech Stack

React 19, TypeScript, Vite, Tailwind CSS, Recharts

## Getting Started

```bash
cd RetirementCalc.Web
npm install
npm run dev
```

## Build

```bash
npm run build    # Production build (output: dist/)
npm run lint     # ESLint
npm run preview  # Preview production build locally
```

## Deployment

Automatically deployed to GitHub Pages on push to `main` via GitHub Actions.
