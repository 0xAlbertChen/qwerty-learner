import DictionaryGroup from './CategoryDicts'
import ChapterList from './ChapterList'
import DictRequest from './DictRequest'
import { LanguageTabSwitcher } from './LanguageTabSwitcher'
import Layout from '@/components/Layout'
import { dictionaries } from '@/resources/dictionary'
import { DictionaryResource, LanguageCategoryType } from '@/typings'
import groupBy, { groupByDictTags } from '@/utils/groupBy'
import * as ScrollArea from '@radix-ui/react-scroll-area'
import { IconX } from '@tabler/icons-react'
import { createContext, useCallback, useMemo } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useNavigate } from 'react-router-dom'
import { Updater, useImmer } from 'use-immer'

export type GalleryState = {
  currentLanguageTab: LanguageCategoryType
  chapterListDict: DictionaryResource | null
}

const initialGalleryState: GalleryState = {
  currentLanguageTab: 'en',
  chapterListDict: null,
}

export const GalleryContext = createContext<{
  state: GalleryState
  setState: Updater<GalleryState>
} | null>(null)

export default function GalleryPage() {
  const [galleryState, setGalleryState] = useImmer<GalleryState>(initialGalleryState)
  const navigate = useNavigate()

  const currentLanguageCategoryDicts = useMemo(
    () => dictionaries.filter((dict) => dict.languageCategory === galleryState.currentLanguageTab),
    [galleryState.currentLanguageTab],
  )
  const groupedByCategory = useMemo(
    () => Object.entries(groupBy(currentLanguageCategoryDicts, (dict) => dict.category)),
    [currentLanguageCategoryDicts],
  )
  const groupedByCategoryAndTag: [string, Record<string, DictionaryResource[]>][] = useMemo(
    () => groupedByCategory.map(([category, dicts]) => [category, groupByDictTags(dicts)]),
    [groupedByCategory],
  )

  const onBack = useCallback(() => {
    navigate('/')
  }, [navigate])

  useHotkeys('enter,esc', onBack, { preventDefault: true })

  return (
    <Layout>
      <GalleryContext.Provider value={{ state: galleryState, setState: setGalleryState }}>
        <ChapterList />
        <div className="relative mb-auto mt-auto flex w-full flex-1 flex-col overflow-y-auto pl-20">
          <IconX className="absolute right-10 top-5 mr-2 w-10 cursor-pointer text-gray-400" onClick={onBack} />
          <div className="mt-20 flex w-full flex-1 items-start justify-center overflow-y-auto">
            <ScrollArea.Root className="h-full max-h-full overflow-y-auto">
              <ScrollArea.Viewport className="h-full w-full pb-[20rem]">
                <div className="sticky top-0 flex h-20 w-full items-center justify-between bg-[#faf9ff] pb-8">
                  <LanguageTabSwitcher />
                  <DictRequest />
                </div>

                <div className="mr-4 flex flex-1 flex-col items-start justify-start gap-14 overflow-y-auto">
                  {groupedByCategoryAndTag.map(([category, groupeByTag]) => (
                    <DictionaryGroup key={category} groupedDictsByTag={groupeByTag} />
                  ))}
                </div>
              </ScrollArea.Viewport>
              <ScrollArea.Scrollbar className="flex touch-none select-none bg-transparent " orientation="vertical"></ScrollArea.Scrollbar>
            </ScrollArea.Root>
            {/* todo: 增加导航 */}
            {/* <div className="w-40 text-center mt-20 h-40 ">
              <CategoryNavigation />
            </div> */}
          </div>
        </div>
      </GalleryContext.Provider>
    </Layout>
  )
}