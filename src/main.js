import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'

import App from './App.vue'

const messages = {
  tw: {
    kanji_art_generator: '文字圖產生器',
    gen_width_letters_total: '產生寬度共',
    gen_width_letters_total_2: '字的文字圖',
    select_pic: '選圖',
    adv_opts: '進階選項',
    list_of_light_to_word: '亮度文字列表',
    close: '關閉',
    show_original_pic: '顯示原圖',
    show_result: '顯示結果',
    scale_percentage: '縮放比例',
    copy: '複製結果文字',
    copy_success: '複製完成！',
    download: '下載結果圖片',
    download_success: '下載完成！'
  },
  en: {
    kanji_art_generator: 'Kanji Art Generator',
    gen_width_letters_total: 'Generate with width of',
    gen_width_letters_total_2: 'characters',
    select_pic: 'Select Image',
    adv_opts: 'Advanced options',
    list_of_light_to_word: 'Luminance text list',
    close: 'Close',
    show_original_pic: 'Original Image',
    show_result: 'Result',
    scale_percentage: 'Scale',
    copy: 'Copy text',
    copy_success: 'Copy complete!',
    download: 'Download image',
    download_success: 'Download complete!'
  },
  jp: {
    kanji_art_generator: '漢字アスキーアート生成',
    gen_width_letters_total: '幅',
    gen_width_letters_total_2: '文字のテキストマップを生成',
    select_pic: '画像の選択',
    adv_opts: '高度なオプション',
    list_of_light_to_word: '輝度テキストリスト',
    close: '閉じる',
    show_original_pic: '元の画像を表示',
    show_result: '結果を表示',
    scale_percentage: 'スケーリング割合',
    copy: 'テキストをコピー',
    copy_success: 'コピー完成！',
    download: '結果の画像をダウンロード',
    download_success: 'ダウンロード完成！'
  }
}

let locale

if (navigator.language === 'ja') {
  locale = 'jp'
} else if (navigator.language.search('zh') > -1) {
  locale = 'tw'
} else {
  locale = 'en'
}

const i18n = createI18n({
  locale,
  fallbackLocale: 'tw',
  messages
})

createApp(App).use(i18n).mount('#app')
