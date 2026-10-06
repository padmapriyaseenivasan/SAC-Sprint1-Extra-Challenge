const grid = document.getElementById("grid");
const columnCount = document.getElementById("columnCount");
const plusBtn = document.getElementById("plusBtn");
const minusBtn = document.getElementById("minusBtn");
const applyColumns = document.getElementById("applyColumns");

const modal = document.getElementById("modal");
const editTitle = document.getElementById("editTitle");
const editColor = document.getElementById("editColor");
const colorPicker = document.getElementById("colorPicker");
const saveEdit = document.getElementById("saveEdit");
const closeModal = document.getElementById("closeModal");

let columns = [
  {id:1,title:"Planning",color:"#4f46e5"},
  {id:2,title:"Design",color:"#0ea5e9"},
  {id:3,title:"Development",color:"#10b981"},
  {id:4,title:"Testing",color:"#f59e0b"}
];
let editingId = null;

function renderGrid(){
  const count = Math.max(1, Math.min(12, Number(columnCount.value) || 1));
  if(columns.length < count){
    for(let i=columns.length;i<count;i++){
      columns.push({id:Date.now()+i,title:`Column ${i+1}`,color:"#8b5cf6"});
    }
  }else if(columns.length > count){
    columns = columns.slice(0,count);
  }
  grid.style.gridTemplateColumns = `repeat(${Math.min(count,4)}, minmax(0,1fr))`;
  grid.innerHTML = "";

  columns.forEach((col,index)=>{
    const card=document.createElement("article");
    card.className="column";
    card.draggable=true;
    card.dataset.id=col.id;
    card.innerHTML=`
      <div class="column-head" style="background-color:${safeColor(col.color)}">
        <span class="column-title">${escapeHtml(col.title)}</span>
        <button class="edit-btn" onclick="openEditor(${col.id})">Edit</button>
      </div>
      <div class="column-body">
        <div><strong>Column ${index+1}</strong></div>
        <p>Drag this column to another position, or enter an order number below.</p>
        <div class="order-row">
          <label>Order:</label>
          <input class="order-input" type="number" min="1" max="${columns.length}" value="${index+1}"
                 onchange="moveByIndex(${col.id}, this.value)">
        </div>
        <span class="drag-label">↕ Drag and drop to reorder</span>
      </div>`;
    grid.appendChild(card);
    card.addEventListener("dragstart",()=>{card.classList.add("dragging")});
    card.addEventListener("dragend",()=>{card.classList.remove("dragging")});
    card.addEventListener("dragover",e=>e.preventDefault());
    card.addEventListener("drop",()=>{
      const dragging=grid.querySelector(".dragging");
      if(!dragging || dragging===card)return;
      const from=columns.findIndex(c=>String(c.id)===dragging.dataset.id);
      const to=columns.findIndex(c=>String(c.id)===card.dataset.id);
      const [moved]=columns.splice(from,1);
      columns.splice(to,0,moved);
      renderGrid();
    });
  });
}

function moveByIndex(id,value){
  let target=Math.max(1,Math.min(columns.length,Number(value)||1))-1;
  const from=columns.findIndex(c=>c.id===id);
  if(from===target)return;
  const [moved]=columns.splice(from,1);
  columns.splice(target,0,moved);
  renderGrid();
}

function openEditor(id){
  editingId=id;
  const col=columns.find(c=>c.id===id);
  editTitle.value=col.title;
  editColor.value=col.color;
  colorPicker.value=validHex(col.color)?col.color:"#4f46e5";
  modal.classList.remove("hidden");
}
window.openEditor=openEditor;

function closeEditor(){modal.classList.add("hidden");editingId=null}
closeModal.onclick=closeEditor;
modal.addEventListener("click",e=>{if(e.target===modal)closeEditor()});

colorPicker.addEventListener("input",()=>editColor.value=colorPicker.value);
editColor.addEventListener("input",()=>{
  if(validHex(editColor.value)) colorPicker.value=editColor.value;
});
document.querySelectorAll(".preset").forEach(btn=>{
  btn.onclick=()=>{editColor.value=btn.dataset.color;colorPicker.value=btn.dataset.color};
});

saveEdit.onclick=()=>{
  const col=columns.find(c=>c.id===editingId);
  const color=validHex(editColor.value)?editColor.value:"#4f46e5";
  col.title=editTitle.value.trim()||col.title;
  col.color=color;
  closeEditor();
  renderGrid();
};

plusBtn.onclick=()=>{
  columnCount.value=Math.min(12,Number(columnCount.value)+1);
  renderGrid();
};
minusBtn.onclick=()=>{
  columnCount.value=Math.max(1,Number(columnCount.value)-1);
  renderGrid();
};
applyColumns.onclick=renderGrid;

function validHex(v){return /^#[0-9a-fA-F]{6}$/.test(v)}
function safeColor(v){return validHex(v)?v:"#4f46e5"}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}

renderGrid();
