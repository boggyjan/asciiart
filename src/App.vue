<template>
  <div class="_hansArt">
    <header>
      <h1>文字圖產生器</h1>
    </header>

    <div class="controls">
      產生寬度共
      <input
        v-model.number="widthTextLength"
        type="range"
        :min="20"
        :max="100"
      >
      {{ widthTextLength }}
      字的文字圖

      <button
        type="button"
        @click="$refs.fileInput.click()"
      >
        選圖
      </button>
      <a
        v-if="!advancedOptionsVisible"
        href="#"
        class="advanced-btn"
        @click="advancedOptionsVisible = true"
      >
        進階選項
      </a>

      <input
        ref="fileInput"
        type="file"
        hidden
        @change="onFileSelected($event)"
      >

      <img
        ref="preview"
        src="/images/mona_lisa.jpg"
        hidden
        @load="onPreviewLoaded($event)"
      >

      <canvas ref="canvas" hidden />

      <div
        v-if="advancedOptionsVisible"
        class="advanced-options"
      >
        <div class="title">
          進階選項
        </div>

        <div class="option-block">
          <div class="option-title">
            亮度文字列表
          </div>

          <div class="options options-grid-5 options-depth-text">
            <div
              v-for="(item, i) in depthText"
              :key="`depth_text_${i}`"
              class="option-col"
            >
              <label :for="`depth_text_input_${i}`">
                {{ i * 10 }}
              </label>
              <input
                :id="`depth_text_input_${i}`"
                v-model="item.text"
                type="text"
                maxlength="1"
                minlength="1"
              >
            </div>
          </div>
        </div>

        <button
          class="close-btn"
          @click="advancedOptionsVisible = false"
        >
          關閉
        </button>
      </div>
    </div>

    <div class="preview">
      <div class="preview-tab">
        <button
          :class="{ active: showOriginalImage }"
          @click="showOriginalImage = true"
        >
          顯示原圖
        </button>
        <button
          :class="{ active: !showOriginalImage }"
          @click="showOriginalImage = false"
        >
          顯示結果
        </button>
      </div>

      <div class="preview-scale">
        縮放比例：{{ Math.floor(previewScale * 100) }}%
      </div>

      <div
        ref="previewImage"
        class="preview-image"
        :style="`transform: scale(${previewScale});`"
      >
        <div class="result-text">
          <pre>{{ resultText }}</pre>
          <img
            ref="originalImage"
            src="/images/mona_lisa.jpg"
            class="original-image"
            :class="{ active: showOriginalImage }"
          >
        </div>
      </div>

      <div class="action">
        <textarea ref="resultTextArea" v-model="resultText" class="result-copy-textarea" />
        <button
          type="button"
          @click="copyResult()"
        >
          {{ copyBtnText }}
        </button>
      </div>
    </div>

    <footer>
      Copyright © {{ new Date().getFullYear() }} Boggy Jang. All rights reserved.
    </footer>
  </div>
</template>

<script>
const copyBtnTextType = {
  normal: '複製結果文字',
  success: '複製完成！'
}
export default {
  data () {
    return {
      // 寬度字數
      widthTextLength: 40,

      // 用來代表亮度的文字
      depthText: [{ text: '龘' }, { text: '嚴' }, { text: '敢' }, { text: '芳' }, { text: '永' }, { text: '北' }, { text: '小' }, { text: '人' }, { text: '丿' }, { text: '、' }, { text: '　' }],
      resultText: '',
      showOriginalImage: false,
      windowWidth: 320,

      copyBtnText: copyBtnTextType.normal,
      advancedOptionsVisible: false
    }
  },

  computed: {
    // window resize, 字數widthTextLength改變時都需要重新計算預覽的縮放比
    previewScale () {
      // 12 is font size
      // 10 is border
      // 20 is body margin
      const zoom = (this.windowWidth - 20 * 2) / (this.widthTextLength * 12 + 10 * 2)
      return Math.min(1, zoom)
    }
  },

  watch: {
    // 當寬度字數與代表亮度的文字被修改後，就重新驅動重繪
    widthTextLength () {
      this.$nextTick(() => {
        if (this.widthTextLength) {
          this.$refs.preview.dispatchEvent(new Event('load'))
        }
      })
    },

    depthText: {
      deep: true,
      handler () {
        this.$nextTick(() => {
          if (this.widthTextLength) {
            this.$refs.preview.dispatchEvent(new Event('load'))
          }
        })
      }
    }
  },

  mounted () {
    window.addEventListener('resize', this.updateWindowWidth)
    this.updateWindowWidth()
  },

  beforeDestroy () {
    window.removeEventListener('resize', this.updateWindowWidth)
  },

  methods: {
    onFileSelected ($event) {
      if (!$event.target.files.length) {
        return
      }

      const file = $event.target.files[0]
      const fileReader = new FileReader()

      fileReader.addEventListener('load', ($event) => {
        this.$refs.preview.src = $event.target.result
        this.$refs.originalImage.src = $event.target.result
      })
      fileReader.readAsDataURL(file)
    },

    onPreviewLoaded ($event) {
      const ctx = this.$refs.canvas.getContext('2d')
      const img = $event.target

      const scale = this.widthTextLength / img.width
      const width = this.widthTextLength
      const height = img.height * scale

      this.$refs.canvas.width = width
      this.$refs.canvas.height = height

      ctx.drawImage(img, 0, 0, width, height)

      const imageData = ctx.getImageData(0, 0, width, height)
      const nomoImageData = []

      function rgb2lab (rgb) {
        let r = rgb[0] / 255
        let g = rgb[1] / 255
        let b = rgb[2] / 255
        let x
        let y
        let z

        r = (r > 0.04045) ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92
        g = (g > 0.04045) ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92
        b = (b > 0.04045) ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92

        x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047
        y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000
        z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883

        x = (x > 0.008856) ? Math.pow(x, 1 / 3) : (7.787 * x) + 16 / 116
        y = (y > 0.008856) ? Math.pow(y, 1 / 3) : (7.787 * y) + 16 / 116
        z = (z > 0.008856) ? Math.pow(z, 1 / 3) : (7.787 * z) + 16 / 116

        return [(116 * y) - 16, 500 * (x - y), 200 * (y - z)]
      }

      for (let i = 0; i < imageData.data.length; i += 4) {
        const r = imageData.data[i]
        const g = imageData.data[i + 1]
        const b = imageData.data[i + 2]
        // const a = imageData.data[i + 3]
        nomoImageData.push(rgb2lab([r, g, b])[0])
      }

      this.resultText = []

      nomoImageData.forEach((light, idx) => {
        const word = this.depthText[Math.round(light / 10)].text.trim()
        this.resultText += word || '　'

        if (idx % this.widthTextLength === this.widthTextLength - 1) {
          this.resultText += '\n'
        }
      })
    },

    copyResult () {
      this.$refs.resultTextArea.focus()
      this.$refs.resultTextArea.select()
      document.execCommand('copy')
      this.$refs.resultTextArea.blur()

      this.copyBtnText = copyBtnTextType.success
      setTimeout(() => {
        this.copyBtnText = copyBtnTextType.normal
      }, 2000)
    },

    updateWindowWidth () {
      this.windowWidth = window.innerWidth
    }
  }
}
</script>

<style lang="scss">
$primary: #6b4;

body {
  margin: 20px;
}

._hansArt {
  // accent-color: $primary;
  accent-color: #49952a;
  font-size: 16px;
  font-weight: 200px;

  a {
    color: #666;
  }

  button {
    padding: 5px 20px;
    appearance: none;
    border: 2px solid $primary;
    background: $primary;
    border-radius: 200px;
    color: #fff;
    font-size: 16px;

    &:hover {
      filter: brightness(0.95);
    }
  }

  input,
  button {
    vertical-align: middle;
  }

  input {
    font-size: 16px;
  }

  input[type="text"] {
    appearance: none;
    box-sizing: border-box;
    display: block;
    width: 100%;
    padding: 5px 10px;
    border: 1px solid #ccc;
    box-shadow: inset 2px 2px 4px #0002;
  }

  header, footer {
    text-align: center;
  }

  header {
    h1 {
      font-weight: 100;
    }
  }

  footer {
    margin-top: 50px;
  }

  .controls {
    position: sticky;
    top: 20px;
    z-index: 1;
    max-width: 1000px;
    margin: 0 auto 50px auto;
    padding: 20px;
    background: #fff;
    box-shadow: 0 4px 16px #0002;
    border-radius: 8px;

    button {
      margin: 0 20px;
    }

    @media (max-width: 575px) {
      button {
        width: 100%;
        margin: 10px 0 10px 0;
      }

      .advanced-btn {
        display: block;
        text-align: right;
      }
    }

    .advanced-options {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #ccc;

      .title {
        margin: 10px 0;
        font-weight: bold;
        opacity: 0.5;
      }

      .option-block {}

      .option-title {
        font-style: italic;
        opacity: 0.75;
      }

      .options {
        padding: 10px 0;

        &-grid-5 {
          display: grid;
          grid-template-columns: repeat(5,1fr);
          grid-gap: 10px;
        }

        &-depth-text {
          .option-col {
            padding-bottom: 8px;
            text-align: center;
          }
        }
      }

      .close-btn {
        display: block;
        width: fit-content;
        margin-left: auto;
        margin-right: auto;
      }
    }
  }

  .preview {
    .preview-tab {
      display: flex;
      justify-content: center;

      button {
        margin: 0;
        background: #fff;
        border-radius: 0;
        color: #666;

        &.active {
          background: $primary;
          color: #fff;
        }

        &:first-child {
          border-bottom-left-radius: 200px;
          border-top-left-radius: 200px;
        }

        &:last-child {
          border-bottom-right-radius: 200px;
          border-top-right-radius: 200px;
        }
      }
    }

    .preview-scale {
      position: relative;
      top: 20px;
      text-align: center;
      font-size: 12px;
      opacity: 0.3;
    }

    .preview-image {
      width: fit-content;
      margin: 25px auto;
      border: 10px solid #fff;
      position: relative;
      background: #fff;
      box-shadow: 0 4px 16px #0002;
      border-radius: 8px;
      transform-origin: top left;

      .original-image {
        display: block;
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
        transition: opacity 0.4s;
        object-fit: cover;

        // :active 是長壓，.active是按鈕切換
        &:active,
        &.active {
          opacity: 1;
        }
      }

      .result-text {
        font-size: 12px;
        line-height: 1;

        pre {
          margin: 0;
        }
      }
    }

    .action {
      text-align: center;
      position: sticky;
      bottom: 20px;

      .result-copy-textarea {
        width: 1px;
        height: 1px;
        opacity: 0;
      }
    }
  }
}
</style>
