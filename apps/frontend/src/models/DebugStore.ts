import { makeAutoObservable } from 'mobx'

const STORAGE_KEY = 'debug-show-task-list-details'

export class DebugStore {
  isOpen = false
  showTaskListDetails = false

  constructor() {
    makeAutoObservable(this)
    this.loadFromStorage()
  }

  private loadFromStorage() {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored !== null) {
      this.showTaskListDetails = stored === 'true'
    }
  }

  toggle() {
    this.isOpen = !this.isOpen
  }

  setShowTaskListDetails(value: boolean) {
    this.showTaskListDetails = value
    localStorage.setItem(STORAGE_KEY, String(value))
  }
}
