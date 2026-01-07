import tsParser from '@typescript-eslint/parser';
import eslintPluginTypescript from '@typescript-eslint/eslint-plugin';
import eslintPluginReact from 'eslint-plugin-react';
import eslintPluginReactHooks from 'eslint-plugin-react-hooks';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import eslintPluginImport from 'eslint-plugin-import';
import eslintPluginFeatureSliced from '@conarti/eslint-plugin-feature-sliced';

export default [
	{
		files: ['**/*.{js,cjs,mjs,jsx,ts,tsx}'],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				ecmaVersion: 'latest',
				sourceType: 'module',
				ecmaFeatures: {
					jsx: true,
				},
			},
			globals: {
				window: 'readonly',
				document: 'readonly',
				navigator: 'readonly',
				// Добавляй другие глобальные переменные, которые нужны (аналог env.browser = true)
			},
		},
		plugins: {
			'@typescript-eslint': eslintPluginTypescript,
			react: eslintPluginReact,
			'react-hooks': eslintPluginReactHooks,
			prettier: eslintPluginPrettier,
			import: eslintPluginImport,
			'@conarti/feature-sliced': eslintPluginFeatureSliced,
		},
		rules: {
			'linebreak-style': ['error', 'unix'],
			'@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
			quotes: ['error', 'single'],
			semi: ['error', 'always'],
			'import/order': [
				'error',
				{
					groups: [
						'external',
						'builtin',
						'internal',
						'sibling',
						'parent',
						'index',
						'object',
						'type',
					],
					pathGroups: [
						{ pattern: 'components', group: 'internal' },
						{ pattern: 'common', group: 'internal' },
						{ pattern: 'routes/**', group: 'internal' },
						{ pattern: 'assets/**', group: 'internal', position: 'after' },
					],
					pathGroupsExcludedImportTypes: ['internal'],
					alphabetize: { order: 'asc', caseInsensitive: true },
				},
			],
			'react/react-in-jsx-scope': 'off',
			'no-unused-vars': ['warn', { args: 'none', caughtErrors: 'all' }],
			'object-curly-spacing': ['error', 'always'],
			'react-hooks/rules-of-hooks': 'error',
			'react-hooks/exhaustive-deps': 'warn',
			'react/self-closing-comp': ['error', { component: true, html: true }],
			'react/display-name': 'off',
			'react/prop-types': 'off',
			'@conarti/feature-sliced/layers-slices': 'error',
			'@conarti/feature-sliced/absolute-relative': 'error',
			'@conarti/feature-sliced/public-api': 'error',
		},
		ignores: ['package-lock.json', 'package.json', 'node_modules/', 'eslint.config.mjs'],
	},
	{
		files: ['.eslintrc.js', '.eslintrc.cjs'],
		languageOptions: {
			parserOptions: { sourceType: 'script' },
			globals: {
				// Можно указать, если нужны глобалы для node
				require: 'readonly',
				module: 'readonly',
				__dirname: 'readonly',
			},
		},
	},
];
