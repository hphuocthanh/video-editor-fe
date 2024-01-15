import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

type PanelOption = 'text' | 'image' | 'video'
interface MenuState {
	activePanel: PanelOption
	setActive: (option: PanelOption) => void
}

const useMenuStore = create<MenuState>()(
	devtools(
		persist(
			(set) => ({
				activePanel: 'text',
				setActive: (option) => set((state) => ({ activePanel: option })),
			}),
			{
				name: 'menu-storage',
			}
		)
	)
)

export default useMenuStore
