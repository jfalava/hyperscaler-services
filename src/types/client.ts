/**
 * HTMLElement with dataset properties for service rows.
 */
export interface HTMLElementWithDataset extends HTMLElement {
	dataset: {
		category: string;
		aws: string;
		azure: string;
		description: string;
		matches?: string;
	};
}

/**
 * HTMLButtonElement with disabled property.
 */
export interface HTMLButtonElementWithDisabled extends HTMLButtonElement {
	disabled: boolean;
}

/**
 * Pagination text translations.
 */
export interface PaginationTranslations {
	showing: string;
	of: string;
	services: string;
}

/**
 * Pagination state management.
 */
export class PaginationManager {
	private currentPage = 1;
	private readonly itemsPerPage = 20;
	private filteredRows: HTMLElementWithDataset[] = [];

	constructor(
		private translations: PaginationTranslations,
		private onFilterChange?: (filteredCount: number) => void
	) {}

	/**
	 * Get all visible (filtered) service rows.
	 */
	getFilteredRows(): HTMLElementWithDataset[] {
		const rows = document.querySelectorAll('.service-row');
		return Array.from(rows).filter((row): row is HTMLElementWithDataset => {
			const element = row as HTMLElementWithDataset;
			return element.dataset.matches !== 'false';
		});
	}

	/**
	 * Display services for the current page.
	 */
	showPage(page: number): void {
		const allRows = document.querySelectorAll('.service-row');
		this.filteredRows = this.getFilteredRows();
		const totalPages = Math.max(1, Math.ceil(this.filteredRows.length / this.itemsPerPage));

		this.currentPage = Math.max(1, Math.min(page, totalPages));

		allRows.forEach((row) => {
			(row as HTMLElement).style.display = 'none';
		});

		const start = (this.currentPage - 1) * this.itemsPerPage;
		const end = start + this.itemsPerPage;

		this.filteredRows.forEach((row, index) => {
			if (index >= start && index < end) {
				row.style.display = '';
			}
		});

		this.updatePaginationUI(totalPages);
	}

	/**
	 * Update pagination UI elements.
	 */
	private updatePaginationUI(totalPages: number): void {
		const prevButton = document.getElementById('prev-page') as HTMLButtonElementWithDisabled | null;
		const nextButton = document.getElementById('next-page') as HTMLButtonElementWithDisabled | null;
		const pageNumbers = document.getElementById('page-numbers');
		const paginationInfo = document.getElementById('pagination-info');
		const pagination = document.getElementById('pagination');

		if (this.filteredRows.length === 0 || totalPages <= 1) {
			if (pagination) {
				pagination.style.display = 'none';
			}
			return;
		}

		if (pagination) {
			pagination.style.display = 'flex';
		}

		if (prevButton) {
			prevButton.disabled = this.currentPage === 1;
		}
		if (nextButton) {
			nextButton.disabled = this.currentPage === totalPages;
		}

		const start = (this.currentPage - 1) * this.itemsPerPage + 1;
		const end = Math.min(this.currentPage * this.itemsPerPage, this.filteredRows.length);
		
		if (paginationInfo) {
			paginationInfo.textContent = `${this.translations.showing} ${start}-${end} ${this.translations.of} ${this.filteredRows.length} ${this.translations.services}`;
		}

		if (pageNumbers) {
			this.createPageNumberButtons(pageNumbers, totalPages);
		}
	}

	/**
	 * Create clickable page number buttons.
	 */
	private createPageNumberButtons(container: HTMLElement, totalPages: number): void {
		container.innerHTML = '';
		const maxButtons = 5;
		let startPage = Math.max(1, this.currentPage - 2);
		let endPage = Math.min(totalPages, startPage + maxButtons - 1);

		if (endPage - startPage < maxButtons - 1) {
			startPage = Math.max(1, endPage - maxButtons + 1);
		}

		for (let i = startPage; i <= endPage; i++) {
			const button = document.createElement('button');
			button.textContent = i.toString();
			button.className = `px-4 py-2 rounded-lg border transition-colors ${
				i === this.currentPage
					? 'bg-primary text-primary-foreground border-primary'
					: 'bg-secondary text-secondary-foreground border-border hover:bg-accent'
			}`;
			button.addEventListener('click', () => this.showPage(i));
			container.appendChild(button);
		}
	}

	/**
	 * Filter service table rows based on search query.
	 */
	filterServices(search: string): void {
		const rows = document.querySelectorAll('.service-row');
		const noResults = document.getElementById('no-results');
		const searchLower = search.toLowerCase().trim();

		rows.forEach((row) => {
			const element = row as HTMLElementWithDataset;
			const category = element.dataset.category || '';
			const aws = element.dataset.aws || '';
			const azure = element.dataset.azure || '';
			const description = element.dataset.description || '';

			const matches =
				searchLower === '' ||
				category.includes(searchLower) ||
				aws.includes(searchLower) ||
				azure.includes(searchLower) ||
				description.includes(searchLower);

			if (matches) {
				delete element.dataset.matches;
			} else {
				element.dataset.matches = 'false';
			}
		});

		this.filteredRows = this.getFilteredRows();
		const hasResults = this.filteredRows.length > 0;

		if (noResults) {
			noResults.style.display = hasResults ? 'none' : 'block';
		}

		if (this.onFilterChange) {
			this.onFilterChange(this.filteredRows.length);
		}

		this.showPage(1);
	}

	/**
	 * Initialize pagination and search functionality.
	 */
	initialize(): void {
		const searchInput = document.getElementById('search') as HTMLInputElement | null;
		const prevButton = document.getElementById('prev-page') as HTMLButtonElementWithDisabled | null;
		const nextButton = document.getElementById('next-page') as HTMLButtonElementWithDisabled | null;

		if (searchInput) {
			searchInput.addEventListener('input', (e: Event) => {
				const target = e.target as HTMLInputElement;
				if (target) {
					this.filterServices(target.value);
				}
			});
		}

		if (prevButton) {
			prevButton.addEventListener('click', () => this.showPage(this.currentPage - 1));
		}

		if (nextButton) {
			nextButton.addEventListener('click', () => this.showPage(this.currentPage + 1));
		}

		this.showPage(1);
	}
}