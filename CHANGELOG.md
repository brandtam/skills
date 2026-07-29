# Changelog

All notable changes to this project will be documented in this file.

## 0.2.0 - 2026-07-29

### Added

Add the setup-release-kit skill and adopt its release workflow in this repo

- New skill installs or upgrades the portable changeset-and-release kit: changeset per PR, CI gate, two-phase tag-based releases, archived notes
- write-changeset no longer scaffolds tooling; it points at setup-release-kit instead
- This repo now dogfoods the kit (scripts, PR gate, changesets)
