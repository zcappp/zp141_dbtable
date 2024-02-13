import React, { Fragment } from "react"
import css from "./zp141_数据库查询表格.css"

const ValidOID = new RegExp("^[0-9a-pA-p]{24}$")
const _id = "_id"
let ref, exc, excA, container, props, rd
let model, Q0, O, count, path
let list, doList, Heads, Rows, R, Paths, Display, tree, data, field, menu, pop, maxCols
let Q = {}
let Hides = []
let Sorts = []
let Sort_ = [] // 倒序

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
        Q0 = JSON.parse(list.query)
        O = JSON.parse(list.option)
        if (typeof O.sort == "string") O.sort.split(" ").forEach(a => {
            if (a) a.startsWith("-") ? Sort_.push(a) : Sorts.push(a)
        })
        list = props.loadMore ? list.all : list.arr
    }
    _doList()
    doList()
    if (props.loadMore) loadMore()
}

function render() {
    if (!list) return <div/>
    const q = JSON.stringify(Q, null, 1) || ""
    return <Fragment>
        <div className="btns">
            {!!props.searchBox && <span className="rmableinput">
                <input defaultValue={q} onBlur={e => {let v = e.target.value; v.startsWith("{") && v.endsWith("}") ? Q = JSON.parse(v) : exc('warn("查询条件必须是合法的json")')}} className="zinput" key={q}/>
                <svg onClick={setDay} viewBox="0 0 1024 1024" className="rminput zsvg clock"><path d="M533.312 556.416V219.52H438.848v392.32h1.472l243.84 140.8 47.296-81.728-198.144-114.432zM511.488 0C794.624 0 1024 229.376 1024 512s-229.376 512-512.512 512C228.864 1024 0 794.624 0 512s228.864-512 511.488-512z"></path></svg>
                <svg onClick={() => {Q = {}; search(); rd()}} viewBox="64 64 896 896" className="rminput zsvg"><path d={RmInput}></path></svg>
            </span>}
            {props.searchFields && props.searchFields.map((o, i) => <label className="rmableinput" key={i}>
                {o.label}<input onBlur={e => search3(o, e)} defaultValue={o.value || ""} className="zinput"/>
                <svg onClick={e => {e.target.previousSibling.value=""; delete Q[o.path]; search(); rd()}} viewBox="64 64 896 896" className="rminput zsvg"><path d={RmInput}></path></svg>
            </label>)}
            {(props.searchBox || props.searchFields) && <button onClick={searchBtn} className="zbtn search">查询</button>}
            {!!props.loaded && <span className="loaded">已加载/总数：<strong>{list.length}</strong>/<strong>{count}</strong></span>}
            {!!props.Excel && <span onClick={toDownload} className="zbtn export">导出</span>}
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
            {Paths.filter(a => !Hides.includes(a)).map((a, i) => <th className={"h" + i} key={i}><a onClick={e => sort(e, a)} className={sortCx(a)} data-seq={sortSeq(a)}>{Heads ? Heads[i] : a}</a></th>)}
        </tr></thead>
        <tbody onClick={e => props.onCellClick && onCellClick(e)} onContextMenu={contextMenu}>{list.map((o, r) => 
            <tr className={(data && data._id === o._id ? "cur" : "") + " r" + r} key={r}>{Paths.filter(a => !Hides.includes(a)).map((k, c) => 
                <td className={"c" + c} key={c}>{Display && Display[c] ? excA(Display[c], {$x: Rows[r][k]}) : Rows[r][k]}</td>
            )}</tr>)}
            {!!props.loadMore && <tr className="observer"/>}
        </tbody>
   </table>
}

function rTree() {
    return <div className="treeWrap">
        <div className="treeHead">{tree.heads.join(" | ")}</div>
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

function loadMore() {
    let el = $(".observer")
    if (!el) return setTimeout(() => loadMore(), 500)
    const o = new IntersectionObserver(entries => entries.forEach(a => {
        if (!a.intersectionRatio || count <= list.length) return
        if (typeof Q._id == "string") delete Q._id
        O.skip = list.length
        search(1)
    }), {})
    o.observe(el)
}

function sortCx(f) {
    return "zsort" + (Sorts.includes(f) ? (Sort_.includes(f) ? " desc" : " asc") : "")
}

function sortSeq(f) {
    return Sorts.includes(f) && Sorts.length > 1 ? Sorts.indexOf(f) + 1 : ""
}

function sort(e, f) {
    if (e.ctrlKey) {
        if (Sorts.includes(f)) {
            if (Sort_.includes(f)) {
                Sorts.splice(Sorts.indexOf(f), 1)
                Sort_.splice(Sort_.indexOf(f), 1)
            } else Sort_.push(f)
        } else Sorts.push(f)
    } else if (Sorts.includes(f)) {
        if (Sort_.includes(f)) {
            Sorts = []
            Sort_ = []
        } else Sort_.push(f)
    } else {
        Sorts = [f]
        Sort_ = []
    }
    O.skip = 0
    search()
}

function search(concat, cb) {
    O.sort = Sorts.map(a => Sort_.includes(a) ? "-" + a : a).join(" ")
    exc(`$${model}.search(path, Q, O, 0)`, { model, path, Q: Object.assign({}, Q, Q0), O }, R => {
        if (!R) return
        list = concat == 1 ? list.concat(R.arr) : R.arr
        count = R.count
        data = undefined
        doList()
        if (props.onSearch) exc(props.onSearch, R)
        rd()
    })
}

function _doList() {
    if (props.diyColumn && props.columns) {
        Paths = props.columns.map(a => a.path)
        Heads = props.columns.map(a => a.header)
        Display = props.columns.map(a => a.display)
        if (props.filterTree && count >= (props.filterMinCount || 30)) {
            if (Array.isArray(props.filterTree[0])) distinct(props.filterTree[0][0], Q0, root => tree = { fields: props.filterTree[0], heads: props.filterTree[1], root, open: {} })
            else distinct(props.filterTree[0], Q0, root => tree = { fields: props.filterTree, heads: props.filterTree, root, open: {} })
        }

        function add(k, v) {
            if (Paths.includes(k)) R[k] = v !== undefined && v !== null && v.toString ? v.toString() : v
        }
        doList = () => {
            Rows = []
            list.forEach((o, i) => {
                R = {}
                Paths.forEach(k => k ? add(k, getIn(o, k)) : "")
                Rows.push(R)
            })
        }
    } else {
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
            if (!Paths.includes(k)) Paths.push(k)
            R[k] = v !== undefined && v !== null && v.toString ? v.toString() : v
        }
        doList = () => {
            Paths = []
            Rows = []
            list.forEach(o => {
                R = {}
                Object.keys(o).forEach(k => recur(k, o[k]))
                Rows.push(R)
            })
            Paths.sort()
        }
        if (props.diyColumn && ref.isDev) ref.updateMeta("p.P.columns", Paths.map(k => { return { header: k, path: k } }))
    }
}

function getIn(o, path) {
    if (typeof path !== "string") return ""
    path = path.split(".")
    return path.reduce((curr, k) => {
        if (!curr) return
        return curr[k]
    }, o)
}

function searchBtn() {
    if (!Q) return Q = {}
    if (typeof Q !== "object") return exc('alert("查询条件必须是合法的json"))')
    O.skip = 0
    search()
}

function search3(o, e) {
    let v = e.target.value
    log(o, v)
    if(v == "") delete Q[o.path]
    if(o.type){
        Q[o.path] = v
    }
}

function distinct(field, query, cb) {
    exc(`$${model}.distinct("", field, query)`, { model, field, query: Object.assign({}, query, Q0) }, ({ arr }) => {
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
    let query = Object.assign({}, Q, Q0)
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
    const R = Rows.slice(0, 20)
    Paths.forEach(h => R.forEach(r => {
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
        await exc(`$${model}.search("download", Q, O, 0)`, { model, Q: Object.assign({}, Q, Q0), O }, R => {
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

function onCellClick(e) {
    let el = getTD(e.target)
    data = list[nthChild(el.parentElement)]
    let path = Paths[nthChild(el)]
    excA(props.onCellClick, { path, $x: getIn(data, path), $ev: e, text: e.target.innerText })
}

/* --------------------------------------------------------------------------------------------- */

function contextMenu(e) {
    if (!props.popFilter) return
    e.preventDefault()
    let k, v, arr
    let el = getTD(e.target)
    if (e.currentTarget.tagName == "THEAD") {
        k = Paths[nthChild(el.parentElement)]
        arr = [
            { txt: "加到筛选树", fn: () => add2Tree(k, e.target.innerText) },
            { txt: "存在此字段", fn: filter(k) },
            { txt: "不存在此字段", fn: filter(k) },
            { txt: "隐藏此字段", fn: () => hideHead(k) }
        ]
        if (Hides.length) arr.push({ txt: "显示字段", fn: showHead, arr: Hides })
    } else { // TBODY
        data = list[nthChild(el.parentElement)]
        k = Paths[nthChild(el)]
        v = getIn(data, k)
        if (props.onRightClick) excA(props.onRightClick, { path: k, $x: v, $ev: e, text: e.target.innerText })
        if (v != undefined && v != null) {
            arr = ["等于", "不等于"]
            if (typeof v == "number") arr = arr.concat(["大于或等于", "小于或等于"])
            if (typeof v == "string" && !isId(v)) arr = arr.concat(["包含", "不包含", "开头是", "末尾是"])
            arr = arr.map(txt => { return { txt, fn: filter(k, v) } })
        } else return
    }
    menu = { arr, top: e.clientY - (innerHeight - e.clientY > 200 ? -16 : 25 * arr.length + 28) + "px", left: e.clientX - (innerWidth - e.clientX > 120 ? 10 : 100) + "px" }
    document.addEventListener("click", hideMenu)
    rd()
}

function getTD(el) {
    return el.nodeName == "TD" || el.nodeName == "TH" ? el : getTD(el.parentElement)
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

function add2Tree(field, head) {
    if (!tree) return distinct(field, Q, root => tree = { fields: [field], heads: [head], root, open: {} })
    tree.fields.push(field)
    tree.heads.push(head)
    rd()
}

function hideHead(v) {
    Hides.push(v)
    rd()
}

function showHead(e) {
    const i = Array.from(e.currentTarget.lastChild.children).indexOf(e.target)
    Hides.splice(i, 1)
    rd()
}





$plugin({
    id: "zp141",
    props: [{
        prop: "data",
        type: "text",
        label: "数据集",
        ph: "($c.x.products)"
    }, {
        prop: "popFilter",
        type: "switch",
        label: "开启右键搜索"
    }, {
        prop: "searchBox",
        type: "switch",
        label: "显示搜索框"
    }, {
        prop: "loaded",
        type: "switch",
        label: "显示已加载/总数"
    }, {
        prop: "Excel",
        type: "switch",
        label: "显示导出按钮"
    }, {
        prop: "loadMore",
        type: "switch",
        label: "开启滚动加载更多"
    }, {
        prop: "searchFields",
        type: "text",
        label: "查询选项数组",
        ph: '(["type", "x.省份", "x.城市"])'
    }, {
        prop: "filterTree",
        type: "text",
        label: "筛选树字段",
        ph: '(["type", "x.一级分类", "x.二级分类"])'
    }, {
        prop: "filterMinCount",
        type: "number",
        ph: "默认至少30条",
        label: "超过多少数据量才显示筛选",
        show: 'p.P.filterTree'
    }, {
        prop: "onSearch",
        type: "text",
        label: "搜索事件",
        ph: 'log(arr, count)',
        show: 'p.P.popFilter || p.P.searchBox'
    }, {
        prop: "onCellClick",
        type: "text",
        label: "单元格点击事件",
        ph: "log(path, text, $x)"
    }, {
        prop: "onRightClick",
        type: "text",
        label: "单元格右键事件",
        ph: "log(path, text, $x)"
    }, {
        prop: "diyColumn",
        type: "switch",
        label: "开启列配置"
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
            prop: "display",
            type: "text",
            label: "渲染表达式",
            ph: "date($x).format()"
        }]
    }],
    render,
    init,
    css
})

const RmInput = "M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9A7.95 7.95 0 0 0 203 838h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z"