/**
 * Pagination state management singleton class.
 * Manages pagination state across the application.
 */
export class PaginationState {
	private static instance: PaginationState;
	private currentPage = 1;
	private totalPages = 1;
	private totalItems = 0;
	private readonly itemsPerPage = 20;
	private listeners: ((state: { currentPage: number; totalPages: number; totalItems: number }) => void)[] = [];

	/**
	 * Gets the singleton instance of PaginationState.
	 * @returns The PaginationState instance
	 */
	static getInstance(): PaginationState {
		if (!PaginationState.instance) {
			PaginationState.instance = new PaginationState();
		}
		return PaginationState.instance;
	}

	/**
	 * Gets the current page number.
	 * @returns Current page number
	 */
	getCurrentPage(): number {
		return this.currentPage;
	}

	/**
	 * Gets the total number of pages.
	 * @returns Total pages count
	 */
	getTotalPages(): number {
		return this.totalPages;
	}

	/**
	 * Gets the total number of items.
	 * @returns Total items count
	 */
	getTotalItems(): number {
		return this.totalItems;
	}

	/**
	 * Gets the number of items per page.
	 * @returns Items per page count
	 */
	getItemsPerPage(): number {
		return this.itemsPerPage;
	}

	/**
	 * Sets the current page number.
	 * @param page - Page number to set
	 */
	setCurrentPage(page: number): void {
		const newPage = Math.max(1, Math.min(page, this.totalPages));
		if (newPage !== this.currentPage) {
			this.currentPage = newPage;
			this.notifyListeners();
		}
	}

	/**
	 * Sets the total number of items and recalculates total pages.
	 * @param totalItems - Total number of items
	 */
	setTotalItems(totalItems: number): void {
		this.totalItems = totalItems;
		this.totalPages = Math.max(1, Math.ceil(totalItems / this.itemsPerPage));
		this.notifyListeners();
	}

	/**
	 * Navigates to the next page.
	 */
	nextPage(): void {
		if (this.currentPage < this.totalPages) {
			this.setCurrentPage(this.currentPage + 1);
		}
	}

	/**
	 * Navigates to the previous page.
	 */
	previousPage(): void {
		if (this.currentPage > 1) {
			this.setCurrentPage(this.currentPage - 1);
		}
	}

	/**
	 * Navigates to a specific page number.
	 * @param page - Page number to navigate to
	 */
	goToPage(page: number): void {
		this.setCurrentPage(page);
	}

	/**
	 * Subscribes to pagination state changes.
	 * @param listener - Callback function to invoke on state changes
	 * @returns Unsubscribe function
	 */
	subscribe(listener: (state: { currentPage: number; totalPages: number; totalItems: number }) => void): () => void {
		this.listeners.push(listener);
		return () => {
			const index = this.listeners.indexOf(listener);
			if (index > -1) {
				this.listeners.splice(index, 1);
			}
		};
	}

	/**
	 * Notifies all listeners of state changes.
	 */
	private notifyListeners(): void {
		const state = {
			currentPage: this.currentPage,
			totalPages: this.totalPages,
			totalItems: this.totalItems
		};
		this.listeners.forEach(listener => listener(state));
	}

	/**
	 * Resets pagination state to initial values.
	 */
	reset(): void {
		this.currentPage = 1;
		this.totalPages = 1;
		this.totalItems = 0;
		this.notifyListeners();
	}
}

export const paginationState = PaginationState.getInstance();