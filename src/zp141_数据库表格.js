import React, { Fragment } from "react"
import css from "./zp141_数据库表格.css"

const ValidOID = new RegExp("^[0-9a-pA-p]{24}$")
const _id = "_id"
let exc, excA

function init(ref) {
    exc = ref.exc
    excA = ref.excA
    ref.Q = {}
    ref.O = {}
    ref.sorts = []
    ref.sortR = [] // 倒序
    const p = ref.props
    if (p.path) ref.ppath = p.path.startsWith("$c.x") ? p.path : "$c.x." + p.path
    if (p.loadMore) loadMore(ref)
    ref.container.export = () => download(ref)
    ref.container.edit = $x => toEdit(ref, $x)
    init1(ref)
}

function render(ref) {
    if (!ref.ppath) return ref.isDev ? <div>请配置数据路径</div> : ""
    ref.D = excA(ref.ppath)
    if (!ref.D) return <div/>
    ref.list = ref.props.loadMore ? ref.D.all : ref.D.arr
    if (!ref.Q0) {
        ref.Q0 = JSON.parse(ref.D.query)
        ref.O = JSON.parse(ref.D.option)
        if (!ref.O.skip) ref.O.skip = 0
        if (typeof ref.O.sort == "string") ref.O.sort.split(" ").forEach(a => {
            if (a) a.startsWith("-") ? ref.sortR.push(a) : ref.sorts.push(a)
        })
        init1(ref)
    }
    ref.doList()
    return <Fragment>{rTop(ref)}<main>{!!ref.tree && rTree(ref)}{rTable(ref)}</main>
        {ref.menu && <div className="menu" style={{top: ref.menu.top, left: ref.menu.left}}>{ref.menu.arr.map(a => <div onClick={a.fn} key={a.txt}>{a.txt}</div>)}</div>}
    {!!ref.pop && rPop(ref)}</Fragment>
}

function rTable(ref) {
    let { props, heads, paths, rows, data, display, sorts, sortR } = ref
    return <table className="ztable zfix">
        <thead onContextMenu={e => contextMenu(ref, e)}><tr>
            {paths.map((a, i) => <th className={"h" + i} key={i}><a onClick={e => sort(ref, e, a)} className={sortCx(sorts, sortR, a)} data-seq={sortSeq(sorts, a)}>{heads ? heads[i] : a}</a></th>)}
        </tr></thead>
        <tbody onClick={e => props.onCellClick && onCellClick(ref, e)} onContextMenu={e => contextMenu(ref, e)}>{ref.list.map((o, r) => 
            <tr className={(data && data._id === o._id ? "cur" : "") + " r" + r} key={r}>{paths.map((k, c) => 
                <td className={"c" + c} key={c}>{display && display[c] ? excA(display[c], {$x: rows[r], path: k, value: rows[r][k]}) : rows[r][k]}</td>
            )}</tr>)}
            {!!props.loadMore && <tr className="observer"/>}
        </tbody>
   </table>
}

function rTree(ref) {
    return <div className="treeWrap">
        <div className="treeHead">{ref.tree.heads.join(" | ")}</div>
        <div className="tree scrollbar">{rTree1(ref, ref.tree.root.concat(["null"]), ref.tree.fields.length - 1, [])}</div>
    </div>
}

function rTree1(ref, root, len, parent) {
    return root.map((a, i) => {
        let path = parent.length ? parent.join("_") + "_" + i : "" + i
        return <div className="node" data-path={path} key={i}>
            <span onClick={e => switcher(ref, e)} className={"switcher" + (len > parent.length ? " hasChild" : "") + (ref.tree.open[path] ? "" : " close")}/>
            <span onClick={e => selNode(ref, e)} className={"txt" + (ref.tree.sel == path ? " selected" : "")}>{a + "" || "空白"}</span>
            {ref.tree.open[path] ? rTree1(ref, ref.tree[path].concat(["null"]), len, parent.concat([i])) : ""}
        </div>
    })
}

function rTop(ref) {
    const p = ref.props
    const q = JSON.stringify(ref.Q, null, 1) || ""
    return <div className="btns">
        {!!p.searchBox && <span className="rmableinput">
            <input defaultValue={q} onBlur={e => {let v = e.target.value; v.startsWith("{") && v.endsWith("}") ? ref.Q = JSON.parse(v) : exc('warn("查询条件必须是合法的json")')}} className="zinput" key={q}/>
            <svg onClick={() => setDay(ref)} viewBox="0 0 1024 1024" className="rminput zsvg clock"><path d="M533.312 556.416V219.52H438.848v392.32h1.472l243.84 140.8 47.296-81.728-198.144-114.432zM511.488 0C794.624 0 1024 229.376 1024 512s-229.376 512-512.512 512C228.864 1024 0 794.624 0 512s228.864-512 511.488-512z"></path></svg>
            <svg onClick={() => {ref.Q = {}; search(ref); ref.render()}} viewBox="64 64 896 896" className="rminput zsvg"><path d={RmInput}></path></svg>
        </span>}
        {p.enableSearchField && p.searchFields && p.searchFields.map((o, i) => searchField(ref, o, i))}
        {(p.searchBox || p.enableSearchField) && <button onClick={() => searchBtn(ref)} className="zbtn search">查询</button>}
        {!!p.loaded && <span className="loaded">已加载/总数：<strong>{ref.D.skip + ref.D.arr.length}</strong>/<strong>{ref.D.count}</strong></span>}
        {!!p.Excel && <span onClick={() => download(ref)} className="zbtn export">导出</span>}
        {p.onNew && p.editPop && <span onClick={() => toEdit(ref)} className="zbtn">新建</span>}
    </div>
}

function rPop(ref) {
    return <div className="zmodals open">
        <div className="zmask"/>
        <div className="zmodal">
            <i onClick={() => {ref.pop = undefined; ref.render()}} className="zdel zhover" />
            <h3 className="hd">{ref.pop[0]}</h3><div className="bd">{ref.pop[1]}</div><div className="ft">{ref.pop[2]}</div>
        </div>
    </div>
}

function searchField(ref, o, i) {
    if (o.options && o.query == "下拉选择") return <label key={i}>
        {o.label || o.path}<select value={ref.Q[o.path] || ""} onChange={e => search0(ref, o, e)} className={"zinput select" + i}>{o.options.map((a, j) => <option value={a} key={j}>{a}</option>)}</select>
    </label>
    if (o.query == "有无") return <label key={i}>
        {o.label || o.path}<select value={ref.Q[o.path] ? (ref.Q[o.path].$exists ? "有" : "无") : ""} onChange={e => search0(ref, o, e)} className={"zinput exist" + i}>{["", "有", "无"].map(a => <option value={a} key={a}>{a}</option>)}</select>
    </label>
    return <label className="rmableinput" key={i}>
        {o.label || o.path}<input onBlur={e => search0(ref, o, e)} placeholder={o.query} defaultValue="" className={"zinput input" + i}/>
        <svg onClick={e => {e.target.previousSibling.value=""; e.preventDefault(); delete ref.Q[o.path]; search(ref); ref.render()}} viewBox="64 64 896 896" className="rminput zsvg"><path d={RmInput}></path></svg>
    </label>
}

function loadMore(ref) {
    let el = $(".observer")
    if (!el) return setTimeout(() => loadMore(ref), 500)
    const o = new IntersectionObserver(entries => entries.forEach(a => {
        if (!a.intersectionRatio || ref.D.count <= ref.list.length) return
        if (typeof ref.Q._id == "string") delete ref.Q._id
        ref.O.skip = ref.list.length
        search(ref, 1)
    }), {})
    o.observe(el)
}

function sortCx(sorts, sortR, f) {
    return "zsort" + (sorts.includes(f) ? (sortR.includes(f) ? " desc" : " asc") : "")
}

function sortSeq(sorts, f) {
    return sorts.includes(f) && sorts.length > 1 ? sorts.indexOf(f) + 1 : ""
}

function sort(ref, e, f) {
    if (e.ctrlKey) {
        if (ref.sorts.includes(f)) {
            if (ref.sortR.includes(f)) {
                ref.sorts.splice(ref.sorts.indexOf(f), 1)
                ref.sortR.splice(ref.sortR.indexOf(f), 1)
            } else ref.sortR.push(f)
        } else ref.sorts.push(f)
    } else if (ref.sorts.includes(f)) {
        if (ref.sortR.includes(f)) {
            ref.sorts = []
            ref.sortR = []
        } else ref.sortR.push(f)
    } else {
        ref.sorts = [f]
        ref.sortR = []
    }
    ref.O.skip = 0
    search(ref)
}

function search(ref, concat, cb) {
    ref.O.sort = ref.sorts.map(a => ref.sortR.includes(a) ? "-" + a : a).join(" ")
    exc(`$${ref.D.model}.search(ref.D.path, Q, ref.O, 0)`, { ref, Q: Object.assign({}, ref.Q, ref.Q0) }, R => {
        if (!R) return
        ref.list = concat == 1 ? ref.list.concat(R.arr) : R.arr
        ref.data = undefined
        ref.doList()
        if (ref.props.onSearch) exc(ref.props.onSearch, R)
        exc('render()')
    })
}

function init1(ref) {
    if (!ref.D) return
    let R
    const p = ref.props
    if (p.diyColumn && p.columns) {
        ref.paths = p.columns.map(a => a.path)
        ref.heads = p.columns.map(a => a.header)
        ref.display = p.columns.map(a => a.display)
        if (p.filterTree && ref.D.count >= (p.filterMinCount || 30)) {
            if (Array.isArray(p.filterTree[0])) distinct(ref, p.filterTree[0][0], ref.Q0, root => ref.tree = { fields: p.filterTree[0], heads: p.filterTree[1], root, open: {} })
            else distinct(ref, p.filterTree[0], ref.Q0, root => ref.tree = { fields: p.filterTree, heads: p.filterTree, root, open: {} })
        }

        function add(k, v) {
            if (ref.paths.includes(k)) R[k] = v !== undefined && v !== null && v.toString ? v.toString() : v
        }
        ref.doList = () => {
            ref.rows = []
            ref.list.forEach((o, i) => {
                R = {}
                ref.paths.forEach(k => k ? add(k, getIn(o, k)) : "")
                ref.rows.push(R)
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
            if (!ref.paths.includes(k)) ref.paths.push(k)
            R[k] = v !== undefined && v !== null && v.toString ? v.toString() : v
        }
        ref.doList = () => {
            ref.paths = []
            ref.rows = []
            ref.list.forEach(o => {
                R = {}
                Object.keys(o).forEach(k => recur(k, o[k]))
                ref.rows.push(R)
            })
            ref.paths.sort()
        }
    }
    if (!ref.isDev) return

    function scroll(k) {
        setTimeout(() => {
            const el = parent.document.querySelector(".nodepe .pP" + k)
            el.scrollIntoViewIfNeeded({ behavior: "smooth" })
            el.style.color = "red"
        }, 200)
    }
    if (p.diyColumn && !p.columns) {
        if (!ref.paths) ref.doList()
        ref.updateMeta("p.P.columns", ref.paths.map(k => { return { header: k, path: k } }))
        scroll("columns")
    }
    if (p.enableSearchField && !p.searchFields) {
        ref.updateMeta("p.P.searchFields", [{ path: "", query: "包含" }])
        scroll("searchFields")
    }
    if (p.enableCRUD && !p.editPop) {
        p.columns.push({ header: "操作", display: 'html(\'<span class="op">编辑</span><span class="op">删除</span>\')' })
        ref.updateMeta("p.P.columns", p.columns)
        ref.updateMeta("p.P.onCellClick", (p.onCellClick ? p.onCellClick + "; " : "") + 'exc($exp[text] || "")')
        ref.updateMeta("joe.exp.删除", 'confirm("提示", "确定要删除吗？数据不可恢复！")\n$' + ref.D.model + '.delete($x._id)\n$r ? info("已删除") : warn("删除失败")\nrender()')
        ref.updateMeta("joe.exp.编辑", '$(".zp141").edit($x)')
        ref.updateMeta("p.P.onNew", '$' + ref.D.model + '.create("' + (ref.D.arr[0] ? ref.D.arr[0].type : "type") + '"' + (ref.D.model == "xdb" ? ', date().getTime() + ""' : "") + ', $x.x); $r ? info("已新建") : warn("新建失败")')
        ref.updateMeta("p.P.onSave", '$' + ref.D.model + '.modify($x._id, { $set: { x: $x.x } }); $r ? info("已保存") : warn("保存失败")')
        ref.updateMeta("p.P.editPop", ref.paths.filter(a => a.path).map((path, i) => { return { path, label: ref.heads[i], type: "单行文本" } }))
        ref.paths = p.columns.map(a => a.path)
        ref.heads = p.columns.map(a => a.header)
        ref.display = p.columns.map(a => a.display)
        scroll("editPop")
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

function searchBtn(ref) {
    if (!ref.Q) return ref.Q = {}
    if (typeof ref.Q !== "object") return exc('alert("查询条件必须是合法的json"))')
    ref.O.skip = 0
    search(ref)
}

function search0({ Q, render }, o, e) {
    let v = e.target.value
    if (o.query == "有无") {
        !v ? delete Q[o.path] : Q[o.path] = { $exists: (v == "有" ? true : false) }
        return render()
    }
    if (!isNaN(v) && (o.query.includes("等于") || o.query.includes("大于") || o.query.includes("小于"))) {
        v = parseFloat(v)
        if (isNaN(v)) {
            delete Q[o.path]
            return render()
        }
    } else if (v == "" || v == null) {
        delete Q[o.path]
        return render()
    }
    let Query = { 等于: v, 下拉选择: v, 不等于: { $ne: v }, 包含: { $regex: v }, 不包含: { $not: { $regex: v } }, 开头是: { $regex: "^" + v }, 末尾是: { $regex: v + "$" }, 大于: { $gt: v }, 小于: { $lt: v }, 大于或等于: { $gte: v }, 小于或等于: { $lte: v } }
    Q[o.path] = Query[o.query]
    render()
}

function distinct(ref, field, query, cb) {
    exc(`$${ref.D.model}.distinct("", field, query)`, { ref, field, query: Object.assign({}, query, ref.Q0) }, ({ arr }) => {
        if (arr.length > 110) {
            exc('warn("数据量太大, 只显示前100条(共" + arr.length + "条)，可通过添加查询条件限制数据量。")', { arr })
            arr = arr.slice(0, 100)
        }
        cb(arr.filter(a => typeof a !== "object"))
        ref.render()
    })
}

function switcher(ref, e) {
    const T = ref.tree
    let path = e.target.parentElement.dataset.path
    T.open[path] = !T.open[path]
    if (T[path] || !T.open[path]) return ref.render()
    if (path.startsWith("_")) path = path.slice(1)
    let arr = path.split("_")
    let field = T.fields[arr.length]
    let query = Object.assign({}, ref.Q, ref.Q0)
    T.fields.forEach(k => delete query[k])
    let parent = arr.shift()
    query[T.fields[0]] = T.root[parent]
    arr.map(a => parseInt(a)).forEach((a, i) => {
        query[T.fields[i + 1]] = T[parent][a]
        parent += "_" + a
    })
    Object.keys(query).forEach(k => { if (query[k] == undefined) query[k] = { $exists: false } })
    distinct(ref, field, query, arr => T[path] = arr)
}

function selNode(ref, e) {
    const T = ref.tree
    T.fields.forEach(k => delete ref.Q[k])
    let path = e.target.parentElement.dataset.path
    T.sel = path
    if (path.startsWith("_")) path = path.slice(1)
    let arr = path.split("_")
    let field = T.fields[arr.length]
    let parent = arr.shift()
    ref.Q[T.fields[0]] = T.root[parent]
    arr.map(a => parseInt(a)).forEach((a, i) => {
        ref.Q[T.fields[i + 1]] = T[parent][a]
        parent += "_" + a
    })
    Object.keys(ref.Q).forEach(k => { if (ref.Q[k] == undefined) ref.Q[k] = { $exists: false } })
    ref.O.skip = 0
    search(ref)
}

function isId(v) {
    return typeof v === "string" && ValidOID.test(v)
}

function setDay(ref) {
    let arr = []
    let type = {}
    const R = ref.rows.slice(0, 20)
    ref.paths.forEach(h => R.forEach(r => {
        let c = r[h]
        if (c && !arr.includes(h) && (isId(c) || !isNaN(c) || (typeof c == "string" && c.endsWith("Z") && c.includes("T")))) {
            arr.push(h)
            type[h] = isId(c) ? _id : (c.endsWith("Z") ? "string" : "number")
        }
    }))
    ref.pop = [<div><select className="zinput">{arr.map((o, i) => <option value={o} key={i}>{o}</option>)}</select>的时间范围</div>, <div>
        <input type="datetime-local" step="1" className="zinput" onKeyDown={e => e.key === "Enter" && op()}/> -&nbsp;
        <input type="datetime-local" step="1" className="zinput" onKeyDown={e => e.key === "Enter" && op()}/>
    </div>, <button className="zbtn main" onClick={op}>查询</button>]

    function op() {
        let f = $(".zmodal select").value
        if (f == arr[0]) f = _id
        if (typeof ref.Q[f] != "object") ref.Q[f] = {}
        const vals = $$(".zmodal input")
        const keyword = ["$gte", "$lte"]
        keyword.forEach((kw, i) => {
            let d = vals[i].value
            if (d) {
                d = new Date(d)
                ref.Q[f][kw] = type[f] == _id ? excA('_id(d)', { d }) : (type[f] == "string" ? d.toJSON() : d.getTime())
            } else delete ref.Q[f][kw]
        })
        if (!Object.keys(ref.Q[f]).length) delete ref.Q[f]
        search(ref)
        ref.pop = undefined
        ref.render()
    }
    ref.render()
}

function download(ref) {
    async function download_() {
        let O = Object.assign({}, ref.O, { skip: 0, limit: 200 })
        if (ref.paths) O.select = ref.paths.join(" ")
        let repeat = Array(Math.ceil(ref.D.count / 200))
        ref.list = []
        for (const a of repeat) {
            await exc(`$${ref.D.model}.search("download", Q, O, 0)`, { ref, Q: Object.assign({}, ref.Q, ref.Q0), O }, R => {
                if (R.arr) R.arr.forEach(a => {
                    delete a.sel
                    ref.list.push(a)
                })
                exc('success("已加载" + ref.list.length + "条数据")', { ref })
                O.skip = O.skip + 200
            })
        }
        ref.doList()
        exc('data2Excel(ref.list, ref.heads, ref.paths, ref.D.model)', { ref })
    }
    if (ref.D.count < 1000) return download_()
    exc('confirm("提示", "数据量有点大, 确定要导出" + ref.D.count + "条数据吗")', { ref }, () => download_())
}

function onCellClick(ref, $ev) {
    let $el = getTD($ev.target)
    if (!$el) return
    ref.data = ref.list[nthChild($el.parentElement)]
    let path = ref.paths[nthChild($el)]
    exc(ref.props.onCellClick, { $el, $ev, path, $x: ref.data, value: getIn(ref.data, path), text: $ev.target.innerText, $exp: ref.ctx.$exp })
}

/* --------------------------------------------------------------------------------------------- */

function contextMenu(ref, e) {
    if (!ref.props.popFilter) return
    e.preventDefault()

    function hideMenu(e) {
        ref.menu = undefined
        ref.render()
        document.removeEventListener("click", hideMenu)
    }

    function add2Tree(field, head) {
        if (!ref.tree) return distinct(ref, field, ref.Q, root => ref.tree = { fields: [field], heads: [head], root, open: {} })
        ref.tree.fields.push(field)
        ref.tree.heads.push(head)
        ref.render()
    }

    const filter = (k, v) => e => {
        const btn = e.target.innerText
        let V = { 存在此字段: { $exists: true }, 不存在此字段: { $exists: false }, 等于: v, 不等于: { $ne: v }, 大于或等于: { $gte: v }, 小于或等于: { $lte: v }, 包含: { $regex: v + "" }, 不包含: { $not: { $regex: v + "" } }, 开头是: { $regex: "^" + v }, 末尾是: { $regex: v + "$" } }
        V = V[btn]
        if (typeof ref.Q._id == "string") delete ref.Q._id
        btn != "等于" && typeof ref.Q[k] == "object" ? Object.assign(ref.Q[k], V) : ref.Q[k] = V
        search(ref)
    }

    let $el = getTD(e.target)
    let k = ref.paths[nthChild($el)]
    if (!k) return
    let arr
    if (e.currentTarget.tagName == "THEAD") {
        arr = [
            { txt: "加到筛选树", fn: () => add2Tree(k, e.target.innerText) },
            { txt: "存在此字段", fn: filter(k) },
            { txt: "不存在此字段", fn: filter(k) }
        ]
    } else { // TBODY
        ref.data = ref.list[nthChild($el.parentElement)]
        let v = getIn(ref.data, k)
        if (ref.props.onRightClick) exc(ref.props.onRightClick, { $el, $ev: e, path: k, $x: ref.data, value: v, text: e.target.innerText, $exp: ref.ctx.$exp })
        if (v != undefined && v != null) {
            arr = ["等于", "不等于"]
            if (typeof v == "number") arr = arr.concat(["大于或等于", "小于或等于"])
            if (typeof v == "string" && !isId(v)) arr = arr.concat(["包含", "不包含", "开头是", "末尾是"])
            arr = arr.map(txt => { return { txt, fn: filter(k, v) } })
        } else return
    }
    let Y = e.clientY + scrollY
    let X = e.clientX + scrollX
    ref.menu = { arr, top: Y - (innerHeight - Y > 200 ? -16 : 25 * arr.length + 28) + "px", left: X - (innerWidth - X > 120 ? 10 : 100) + "px" }
    document.addEventListener("click", hideMenu)
    ref.render()
}

function getTD(el) {
    if (el.nodeName != "TABLE") return el.nodeName == "TD" || el.nodeName == "TH" ? el : getTD(el.parentElement)
}

function nthChild(el) {
    let i = 0
    while ((el = el.previousElementSibling) != null) i++
    return i
}

function toEdit(ref, $x) {
    function get(o) {
        return o.path.split(".").reduce((curr, k) => {
            if (!curr) return
            return curr[k]
        }, O)
    }

    function setIn(o, path, v) {
        if (path.length > 1) {
            let p = path[0]
            if (o[p] === undefined || typeof o[p] !== "object") o[p] = parseInt(path[1]).toString() == path[1] ? [] : {}
            setIn(o[p], path.slice(1), v)
        } else {
            v === undefined ? delete o[path[0]] : o[path[0]] = v
        }
    }
    const set = (o, v) => {
        let path = o.path.split(".")
        if (o.type == "单选") {
            //
        } else if (o.type == "多选") {
            let V = get(o)
            if (!Array.isArray(V)) V = []
            V.indexOf(v) > -1 ? V.splice(V.indexOf(v), 1) : V.push(v)
            v = V
        } else if (o.type == "布尔值") {
            v = v.target.checked
        } else {
            v = v.target.value
            if (v == "") return setIn(O, path, undefined)
            if (o.type == "数值") v = parseFloat(v)
        }
        setIn(O, path, v)
    }

    let O = $x ? JSON.parse(JSON.stringify($x)) : {}
    const Type = {
        单行文本: o => <input defaultValue={get(o)} onChange={e => set(o, e)} className="zinput"/>,
        多行文本: o => <textarea defaultValue={get(o)} onChange={e => set(o, e)} className="zinput"/>,
        数值: o => <input type="number" defaultValue={get(o)} onChange={e => set(o, e)} className="zinput"/>,
        下拉选择: o => <select defaultValue={get(o)} onChange={e => set(o, e)} className="zinput">{(o.options || ["未配置选项列表"]).map((a, i) => <option value={a} key={i}>{a}</option>)}</select>,
        单选: o => (o.options || ["未配置选项列表"]).map((a, i) => <label key={i}><input onChange={e => set(o, a)} type="radio" name={o.path} defaultChecked={get(o) == a}/>{a}</label>),
        多选: o => (o.options || ["未配置选项列表"]).map((a, i) => <label key={i}><input onChange={e => set(o, a)} type="checkbox" name={o.path} defaultChecked={(get(o) || []).includes(a)}/>{a}</label>),
        布尔值: o => <input type="checkbox" defaultChecked={!!get(o)} onChange={e => set(o, e)}/>,
        日期: o => <input type="date" defaultValue={get(o)} onChange={e => set(o, e)} className="zinput"/>,
        时间: o => <input type="time" step="1" defaultValue={get(o)} onChange={e => set(o, e)} className="zinput"/>,
        日期时间: o => <input type="datetime-local" step="1" defaultValue={get(o) ? new Date(get(o)).format("YYYY-MM-DDTHH:MM:ss") : undefined} onChange={e => set(o, e)} className="zinput"/>,
    }
    ref.pop = [$x ? "编辑" : "新建", <div className="editpop">{ref.props.editPop.map((o, i) => <label key={i}><span className={o.required ? "zstar" : ""}>{o.label || o.path}</span>{Type[o.type](o)}</label>)}</div>, <button className="zbtn main" onClick={() => op()}>提交</button>]

    function op() {
        exc($x ? ref.props.onSave : ref.props.onNew, { $x: O }, () => {
            ref.pop = undefined
            ref.render()
        })
    }
    ref.render()
}


$plugin({
    id: "zp141",
    props: [{
        prop: "path",
        type: "text",
        label: "数据路径",
        ph: "search()的第一个参数"
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
        label: "开启滚动加载"
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
        show: "P.filterTree"
    }, {
        prop: "onSearch",
        type: "text",
        label: "搜索事件",
        ph: 'log(arr, count)',
        show: "P.popFilter || P.searchBox"
    }, {
        prop: "onCellClick",
        type: "text",
        label: "单元格点击事件",
        ph: "log($x, path, value, text, $ev, $el, $exp)"
    }, {
        prop: "onRightClick",
        type: "text",
        label: "单元格右键事件",
        ph: "log($x, path, value, text, $ev, $el, $exp)"
    }, {
        prop: "diyColumn",
        type: "switch",
        label: "开启列配置"
    }, {
        prop: "columns",
        type: "array",
        label: "列配置",
        show: "P.diyColumn",
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
            ph: "date(value).format()"
        }]
    }, {
        prop: "enableSearchField",
        type: "switch",
        label: "开启查询选项"
    }, {
        prop: "searchFields",
        type: "array",
        label: "查询选项",
        show: "P.enableSearchField",
        struct: [{
            prop: "label",
            type: "text",
            label: "表单标签",
            ph: "为空时显示字段路径"
        }, {
            prop: "path",
            type: "text",
            label: "字段路径"
        }, {
            prop: "query",
            type: "select",
            label: "查询query",
            items: ["有无", "下拉选择", "等于", "不等于", "包含", "不包含", "开头是", "末尾是", "大于", "小于", "大于或等于", "小于或等于"]
        }, {
            prop: "options",
            type: "text",
            label: "选项列表",
            ph: '(["", "男", "女"])'
        }]
    }, {
        prop: "enableCRUD",
        type: "switch",
        label: "开启【新建/删除/编辑】操作"
    }, {
        prop: "onNew",
        type: "text",
        label: "新建事件",
        show: "P.enableCRUD"
    }, {
        prop: "onSave",
        type: "text",
        label: "保存事件",
        show: "P.enableCRUD"
    }, {
        prop: "editPop",
        type: "array",
        label: "新建/编辑表单选项",
        show: "P.enableCRUD",
        struct: [{
            prop: "label",
            type: "text",
            label: "表单标签",
            ph: "为空时显示字段路径"
        }, {
            prop: "path",
            type: "text",
            label: "字段路径"
        }, {
            prop: "type",
            type: "select",
            label: "字段类型",
            items: ["单行文本", "多行文本", "数值", "布尔值", "单选", "多选", "下拉选择", "日期", "时间", "日期时间"]
        }, {
            prop: "placeholder",
            type: "text",
            label: "占位符",
            ph: 'placeholder'
        }, {
            prop: "required",
            type: "switch",
            label: "是否必填"
        }, {
            prop: "options",
            type: "text",
            label: "选项列表",
            ph: '(["", "男", "女"])'
        }]
    }],
    render,
    init,
    css
})

const RmInput = "M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9A7.95 7.95 0 0 0 203 838h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z"