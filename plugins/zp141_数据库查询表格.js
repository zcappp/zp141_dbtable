import React, { Fragment } from "react"
import css from "./zp141_数据库查询表格.css"

const _id = "_id"
let ref, exc, excA, container, props, rd
let model, QQ, O, count, path
let list, tblH, tblR, R, tree, data, field, menu, pop, maxCols
let Q = {}
let hides = []
let sorts = []
let _sort = [] // 倒序

function init(_ref) {
    ref = _ref
    exc = ref.exc
    excA = ref.excA
    container = ref.container
    props = ref.props
    rd = ref.render
    list = props.data || []
    if (list.all && list.model) {
        model = list.model
        path = list.path
        count = list.count
        QQ = JSON.parse(list.query)
        O = JSON.parse(list.option)
        if (typeof O.sort == "string") O.sort.split(" ").forEach(a => {
            if (a) a.startsWith("-") ? _sort.push(a) : sorts.push(a)
        })
        list = list.all
    }
    doList()
    ready()
}

function render() {
    if (!list) return <div/>
    const q = JSON.stringify(Q, null, 1) || ""
    return <Fragment>
        <div className="search">
            <svg onClick={setDay} viewBox="0 0 1024 1024" className="zsvg clock"><path d="M533.312 556.416V219.52H438.848v392.32h1.472l243.84 140.8 47.296-81.728-198.144-114.432zM511.488 0C794.624 0 1024 229.376 1024 512s-229.376 512-512.512 512C228.864 1024 0 794.624 0 512s228.864-512 511.488-512z"></path></svg>
            <span className="rmableinput">
                <input defaultValue={q} onBlur={search2} onKeyDown={e => e.key === "Enter" && search2()} className="zinput" key={q}/>
                <svg  onClick={() => {tree = undefined; Q = {}; rd()}}viewBox="64 64 896 896" className="rminput zsvg"><path d="M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9A7.95 7.95 0 0 0 203 838h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z"></path></svg>
            </span>
            <button onClick={search2} className="zbtn" style={{margin:"0 5px"}}>查询</button>
        </div>
        <div className="loaded">
            <div style={{"margin": "6px"}}>已加载/总数：<strong>{list.length}</strong>/<strong>{count}</strong></div>
            <div><span onClick={toDownload} className="zbtn">导出</span></div>
        </div>
        <div className="main">{!!tree && rTree()}{rTable()}</div>
        {menu && <div className="menu" style={{top: menu.top, left: menu.left}}>{menu.arr.map(a => rMenu(a))}</div>}
        {!!pop && <div className="zmodals">
            <div className="zmask" onClick={close}/>
            <div className="zmodal">
                <svg onClick={close} className="zsvg zsvg-x" viewBox="64 64 896 896"><path d="M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9A7.95 7.95 0 0 0 203 838h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z"></path></svg>
                <div className="zmodal-hd">{pop[0]}</div><div className="zmodal-bd">{pop[1]}</div><div className="zmodal-ft">{pop[2]}</div>
            </div>
        </div>}
    </Fragment>
}

function rTable() {
    return <table className="ztable">
        <thead onContextMenu={contextMenu}><tr>
            {tblH.filter(a => !hides.includes(a)).map(a => <th title={a} key={a}><a onClick={e => sort(e, a)} className={sortCx(a)} data-seq={sortSeq(a)}>{a}</a></th>)}
        </tr></thead>
        <tbody onContextMenu={contextMenu}>{list.map((o, i) => 
            <tr className={data && data._id === o._id ? " cur" : ""} key={i}>
                {tblH.filter(a => !hides.includes(a)).map(k => <td title={tblR[i][k] && tblR[i][k].length > 20 ? tblR[i][k] + "" : ""} key={k}>{tblR[i][k]}</td>)}
            </tr>)}
            <tr className="observer"/>
        </tbody>
    </table>
}

function rTree() {
    return <div className="treeWrap">
        <div className="treeHead">{tree.fields.join(" | ")}</div>
        <div className="tree scrollbar">{rTree1(tree.root, tree.fields.length - 1, [])}</div>
    </div>
}

function rTree1(arr, len, parent) {
    return arr.map((a, i) => {
        let path = parent.length ? parent.join("_") + "_" + i : "" + i
        return <div className="node" data-path={path} key={i}>
            <span onClick={switcher} className={"switcher" + (len > parent.length ? " hasChild" : "") + (tree.open[path] ? "" : " close")}/>
            <span onClick={selNode} className={"txt" + (tree.sel == path ? " selected" : "")}>{a + "" || "空白"}</span>
            {tree.open[path] ? rTree1(tree[path], len, parent.concat([i])) : ""}
        </div>
    })
}

function rMenu(a) {
    if (!a.arr) return <div onClick={a.fn} title={a.title} key={a.txt}>{a.txt}</div>
    return <div onClick={a.fn} className="hasSubmenu" key={a.txt}>{a.txt}
        <svg viewBox="64 64 896 896" className="zsvg left"><path d="M724 218.3V141c0-6.7-7.7-10.4-12.9-6.3L260.3 486.8a31.86 31.86 0 0 0 0 50.3l450.8 352.1c5.3 4.1 12.9.4 12.9-6.3v-77.3c0-4.9-2.3-9.6-6.1-12.6l-360-281 360-281.1c3.8-3 6.1-7.7 6.1-12.6z"></path></svg>
        <div className="menu submenu">{a.arr.map(b => <div key={b}>{b}</div>)}</div>
    </div>
}

function ready() {
    let el = $(".observer")
    if (!el || !window.monaco) return setTimeout(() => ready(), 500)
    const o = new IntersectionObserver(entries => entries.forEach(a => {
        if (!a.intersectionRatio || count <= list.length) return
        if (typeof Q._id == "string") delete Q._id
        O.skip = list.length
        search(1)
    }), {})
    o.observe(el)
}

function sortCx(f) {
    return "zsort" + (sorts.includes(f) ? (_sort.includes(f) ? " desc" : " asc") : "")
}

function sortSeq(f) {
    return sorts.includes(f) && sorts.length > 1 ? sorts.indexOf(f) + 1 : ""
}

function sort(e, f) {
    if (e.ctrlKey) {
        if (sorts.includes(f)) {
            if (_sort.includes(f)) {
                sorts.splice(sorts.indexOf(f), 1)
                _sort.splice(_sort.indexOf(f), 1)
            } else _sort.push(f)
        } else sorts.push(f)
    } else if (sorts.includes(f)) {
        if (_sort.includes(f)) {
            sorts = []
            _sort = []
        } else _sort.push(f)
    } else {
        sorts = [f]
        _sort = []
    }
    O.skip = 0
    search()
}

function search(concat, cb) {
    O.sort = sorts.map(a => _sort.includes(a) ? "-" + a : a).join(" ")
    exc(`$${model}.search(path, Q, O, 0)`, { model, path, Q: Object.assign({}, Q, QQ), O }, R => {
        list = concat == 1 ? list.concat(R.arr) : R.arr
        count = R.count
        data = undefined
        doList()
        rd()
    })
}

function doList() {
    tblH = []
    tblR = []
    list.forEach(o => {
        R = {}
        Object.keys(o).forEach(k => recur(k, o[k]))
        tblR.push(R)
    })
    tblH.sort()
    if (tblH.length > 600) {
        if (!maxCols) GV.alert("共有" + tblH.length + "列", "数据量太大，仅展示前500列，建议只查看某一类型的数据或切换到json视图")
        maxCols = true
        tblH = tblH.slice(0, 500)
    }
}

function recur(K, O) {
    if (O && typeof O === "object") {
        Object.keys(O).forEach(k => {
            let v = O[k]
            k = K + "." + k
            if (Array.isArray(v)) {
                if (v[0] && typeof v[0] === "object" && !Array.isArray(v[0])) return v.forEach((a, i) => recur(k + "." + i, a))
                add(k, JSON.stringify(v))
            } else if (v && typeof v === "object") {
                recur(k, v)
            } else add(k, v)
        })
    } else add(K, O)
}

function add(k, v) {
    if (!tblH.includes(k)) tblH.push(k)
    R[k] = v !== undefined && v !== null && v.toString ? v.toString() : v
}

function getIn(o, path) {
    path = path.split(".")
    return path.reduce((curr, k) => {
        if (!curr) return
        return curr[k]
    }, o)
}

function search2() {
    Q = $(".search input").value
    if (!Q) return Q = {}
    if (!Q.startsWith("{") || !Q.endsWith("}")) return exc('warn("查询条件必须是合法的json")')
    Q = JSON.parse(Q)
    if (typeof Q !== "object") return GV.alert("查询条件必须是合法的json")
    O.skip = 0
    search()
}

function distinct(field, query, cb) {
    exc(`$${model}.distinct("", field, query)`, { model, field, query: Object.assign({}, query, QQ) }, ({ arr }) => {
        if (arr.length > 110) {
            exc('warn("数据量太大, 只显示前100条(共" + arr.length + "条)，可通过添加查询条件限制数据量。")', { arr })
            arr = arr.slice(0, 100)
        }
        cb(arr.filter(a => typeof a !== "object"))
        rd()
    })
}

function close() {
    pop = undefined
    rd()
}

function switcher(e) {
    let path = e.target.parentElement.dataset.path
    tree.open[path] = !tree.open[path]
    if (tree[path] || !tree.open[path]) return rd()
    if (path.startsWith("_")) path = path.slice(1)
    let arr = path.split("_")
    let field = tree.fields[arr.length]
    let query = Object.assign({}, Q, QQ)
    tree.fields.forEach(k => delete query[k])
    let parent = arr.shift()
    query[tree.fields[0]] = tree.root[parent]
    arr.map(a => parseInt(a)).forEach((a, i) => {
        query[tree.fields[i + 1]] = tree[parent][a]
        parent += "_" + a
    })
    distinct(field, query, arr => tree[path] = arr)
}

function selNode(e) {
    tree.fields.forEach(k => delete Q[k])
    let path = e.target.parentElement.dataset.path
    tree.sel = path
    if (path.startsWith("_")) path = path.slice(1)
    let arr = path.split("_")
    let field = tree.fields[arr.length]
    let parent = arr.shift()
    Q[tree.fields[0]] = tree.root[parent]
    arr.map(a => parseInt(a)).forEach((a, i) => {
        Q[tree.fields[i + 1]] = tree[parent][a]
        parent += "_" + a
    })
    O.skip = 0
    search()
}

function isId(v) {
    return typeof v === "string" && ValidOID.test(v)
}

function setDay() {
    let arr = []
    let type = {}
    const R = tblR.slice(0, 20)
    tblH.forEach(h => R.forEach(r => {
        let c = r[h]
        if (c && !arr.includes(h) && (isId(c) || !isNaN(c) || (typeof c == "string" && c.endsWith("Z") && c.includes("T")))) {
            arr.push(h)
            type[h] = isId(c) ? _id : (c.endsWith("Z") ? "string" : "number")
        }
    }))
    pop = [<div><select>{arr.map((o, i) => <option value={o} key={i}>{o}</option>)}</select>的时间范围</div>, <div>
        <input type="datetime-local" step="1" className="zinput" onKeyDown={e => e.key === "Enter" && op()}/> -&nbsp;
        <input type="datetime-local" step="1" className="zinput" onKeyDown={e => e.key === "Enter" && op()}/>
    </div>, <button className="zbtn zprimary" onClick={op}>查询</button>]

    function op() {
        let f = $(".zmodal select").value
        if (f == arr[0]) f = _id
        if (typeof Q[f] != "object") Q[f] = {}
        const vals = $$(".zmodal input")
        const keyword = ["$gte", "$lte"]
        keyword.forEach((kw, i) => {
            let d = vals[i].value
            if (d) {
                d = new Date(d)
                Q[f][kw] = type[f] == _id ? excA('_id(d)', { d }) : (type[f] == "string" ? d.toJSON() : d.getTime())
            } else delete Q[f][kw]
        })
        if (!Object.keys(Q[f]).length) delete Q[f]
        search()
        close()
    }
    rd()
}

function toDownload() {
    if (count < 1000) return download_()
    exc('confirm("提示", "数据量有点大, 确定要导出" + count + "条数据吗")', { count }, () => download_())
}

async function download_() {
    const limit = 200
    let repeat = Array(Math.ceil(count / limit))
    list = []
    for (const a of repeat) {
        await exc(`$${model}.search("download", Q, O, 0)`, { model, Q: Object.assign({}, Q, QQ), O }, R => {
            if (R.arr) R.arr.forEach(a => {
                delete a.sel
                list.push(a)
            })
            exc('success("已加载" + list.length + "条数据")', { list })
            O.skip = O.skip + limit
        })
    }
    doList()
    exc('data2Excel(list, null, null, model)', { model, list })
    rd()
}

/* --------------------------------------------------------------------------------------------- */

function contextMenu(e) {
    e.preventDefault()
    let k, v, arr
    if (e.currentTarget.tagName == "THEAD") {
        k = e.target.innerText
        arr = [
            { txt: "加到筛选树", fn: () => add2Tree(k) },
            { txt: "存在此字段", fn: filter(k) },
            { txt: "不存在此字段", fn: filter(k) },
            { txt: "隐藏此字段", fn: () => hideHead(k) }
        ]
        if (hides.length) arr.push({ txt: "显示字段", fn: showHead, arr: hides })
    } else { // TBODY
        const colIdx = nthChild(e.target)
        const rowIdx = nthChild(e.target.parentElement)
        data = list[rowIdx]
        k = tblH[colIdx]
        v = getIn(data, k)
        if (v != undefined && v != null) {
            arr = ["等于", "不等于"]
            if (typeof v == "number") arr = arr.concat(["大于或等于", "小于或等于"])
            if (typeof v == "string" && !isId(v)) arr = arr.concat(["包含", "不包含", "开头是", "末尾是"])
            arr = arr.map(txt => { return { txt, fn: filter(k, v) } })
        } else return
    }
    if (k != _id && typeof v == "string") {
        Separator.forEach(s => {
            if (v.includes(s)) v = v.split(s).find(v => v.length == 24) || v
        })
        if (v.length > 24) v = v.slice(0, 24)
        if (isId(v)) arr.splice(0, 0, { txt: "查询此_id", fn: () => openId(v) })
    }
    menu = { arr, top: e.clientY - (innerHeight - e.clientY > 200 ? -16 : 25 * arr.length + 28) + "px", left: e.clientX - (innerWidth - e.clientX > 120 ? 10 : 100) + "px" }
    document.addEventListener("click", hideMenu)
    rd()
}

function hideMenu(e) {
    menu = undefined
    rd()
    document.removeEventListener("click", hideMenu)
}

function nthChild(el) {
    let i = 0
    while ((el = el.previousElementSibling) != null) i++
    return i
}

const filter = (k, v) => e => {
    const btn = e.target.innerText
    let V = { 存在此字段: { $exists: true }, 不存在此字段: { $exists: false }, 等于: v, 不等于: { $ne: v }, 大于或等于: { $gte: v }, 小于或等于: { $lte: v }, 包含: { $regex: v + "" }, 不包含: { $not: { $regex: v + "" } }, 开头是: { $regex: "^" + v }, 末尾是: { $regex: v + "$" } }
    V = V[btn]
    if (typeof Q._id == "string") delete Q._id
    btn != "等于" && typeof Q[k] == "object" ? Object.assign(Q[k], V) : Q[k] = V
    search()
}

function openId(_id) {
    API(znod, "idinwhichdb", { _id }, o => window.open("/app/" + o.ai + "/inndb/" + o.db + "?Q=" + JSON.stringify({ _id })))
}

function add2Tree(field, fields = [field]) {
    if (tree) {
        tree.fields.push(field)
        return rd()
    }
    distinct(field, Q, root => tree = { fields, root, open: {} })
}

function hideHead(v) {
    hides.push(v)
    rd()
}

function showHead(e) {
    const i = Array.from(e.currentTarget.lastChild.children).indexOf(e.target)
    hides.splice(i, 1)
    rd()
}


const Separator = ["_", " ", ".", ":", "#", "|", ","]
const ValidOID = new RegExp("^[0-9a-pA-p]{24}$")



$plugin({
    id: "zp141",
    props: [{
        prop: "data",
        type: "text",
        label: "数据集",
        ph: "($c.x.products)"
    }, {
        prop: "fixedColStart",
        type: "text",
        label: "固定列"
    }, {
        prop: "filter",
        type: "switch",
        label: "服务器端筛选"
    }, {
        prop: "filterFields",
        type: "text",
        label: "可筛选字段",
        ph: '(["type", "x.省份", "x.城市"])',
        show: 'p.P.filter'
    }, {
        prop: "filterTree",
        type: "text",
        label: "筛选树字段",
        ph: '(["type", "x.一级分类", "x.二级分类"])',
        show: 'p.P.filter'
    }, {
        prop: "filterMinCount",
        type: "number",
        ph: "默认至少30条",
        label: "超过多少数据量才显示筛选"
    }, {
        prop: "Excel",
        type: "switch",
        label: "Excel"
    }, {
        prop: "readOnly",
        type: "switch",
        label: "只读",
        show: '!p.P.Excel'
    }, {
        prop: "diyColumn",
        type: "switch",
        label: "使用自定义列配置"
    }, {
        prop: "columns",
        type: "array",
        label: "列配置",
        show: 'p.P.diyColumn',
        struct: [{
            prop: "header",
            type: "text",
            label: "表头"
        }, {
            prop: "path",
            type: "text",
            label: "字段路径"
        }, {
            prop: "align",
            type: "select",
            insertEmpty: 1,
            label: "对齐方式",
            items: [
                [1, 2, 3],
                ["左对齐", "中间对齐", "右对齐"]
            ]
        }, {
            prop: "width",
            type: "number",
            label: "宽度",
            ph: "px, 默认自适应"
        }, {
            prop: "readOnly",
            type: "switch",
            label: "只读",
            show: '!p.P.readOnly'
        }]
    }],
    render,
    init,
    css
})