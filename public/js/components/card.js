// conditional imports would be great however we're not using webpack
import StickerCard from './sticker.js';
import LineChartCard from './lineChart.js';
import PieChartCard from './pieChart.js';
import ButtonCard from './button.js';
import NumberCard from './number.js';
import FormCard from './form.js';

const template = `
  <div class="card" v-bind:class="{'dragging': dragging}" v-bind:style="style" v-on:mousedown.stop="onMouseDown">
   <template v-if="showChildCard">
     <div v-if="showControls" class="controls">
        <button class="edit" ref="editButton" v-on:click="onEdit">edit</button>
        <button class="delete" v-on:click="onDelete(tile.id)">X</button>
      </div>
      <h2 v-if="tile.title">{{tile.title}} </h2>
      <component v-bind:is="childCard" v-bind:tile="tile" v-bind:blockSize="blockSize" v-bind:messages="messages"></component>
  </template>
    <card-form v-if="showForm" v-bind:editing="editing" v-bind:tile="tile" v-bind:deviceList="deviceList" v-on:save-settings="onSaveSettings"></card-form>
  </div>`;

export default Vue.component('card-base', {
  template,
  props: ['tile', 'blockSize', 'deviceList', 'messages', 'editMode'],
  data: function() {
    return {
      editing: false,
      dragging: false,
      mouseMoved: false,
      y: this.tile.position[1],
      x: this.tile.position[0],
      offsetY: 0,
      offsetX: 0
    }
  },
  methods: {
    onMouseDown: function(event) {
      if (!this.dragging && event.target.tagName !== 'INPUT' && this.editMode === 'unlocked') {
        this.dragging = true;
        this.offsetY = event.clientY - this.y;
        this.offsetX = event.clientX - this.x;
        window.addEventListener('mousemove', this.onMouseMove, true);
      }
    },
    onMouseMove: function(event) {
      this.mouseMoved = true;
      this.y = event.clientY - this.offsetY;
      this.x = event.clientX - this.offsetX;
    },
    onMouseUp: function(event) {
      window.removeEventListener('mousemove', this.onMouseMove, true);
      if (this.dragging && this.mouseMoved) {
        const newPosition = {position: [this.x, this.y]};
        const eventData = Object.assign({}, this.tile, newPosition);

        this.$emit('tile-position', eventData);
      }
      this.dragging = false;
      this.mouseMoved = false;
    },
    onEdit: function() {
      this.editing = true;
    },
    onDelete: function(tileId) {
      const message = 'Oh, do you really want to remove this card?';
      const confirm = window.confirm(message);
      if (confirm) {
        this.$emit('tile-delete', tileId);
      }
    },
    onSaveSettings: function(event) {
      this.editing = false;
      // focus on edit button
      this.$nextTick(function(){ this.$refs.editButton.focus() });
      this.$emit('tile-settings', event);
    }
  },
  computed: {
    top: function() {
      return `${this.y}px`;
    },
    left: function() {
      return `${this.x}px`;
    },
    style: function() {
      return { 
        top: this.top, 
        left: this.left,
        width: `${this.blockSize[0] * this.tile.size[0]}px`,
        minHeight: `${this.blockSize[1] * this.tile.size[1]}px`
      };
    },
    childCard: function() {
      return `card-${this.tile.type.toLowerCase()}`;
    },
    showChildCard: function() {
      return !this.editing
    },
    showForm: function() {
      return this.editing
    },
    showControls: function() {
      return this.editMode === 'unlocked';
    }
  },
  mounted() {
    window.addEventListener('mouseup', this.onMouseUp, false);
  }
});

