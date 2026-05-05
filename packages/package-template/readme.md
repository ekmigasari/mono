1. Duplicate this package and rename it to the package you want to create.
2. package.json -> rename: @organization/package-name
3. import in package.json of the repo that will use this package as dependency. example

```
"dependencies": {
		"@organization/package-name": "workspace:*",
	}
```
