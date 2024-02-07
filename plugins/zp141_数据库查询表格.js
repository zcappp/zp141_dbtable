import React from "react"

let O, ai, db, url, urlQuery, type, menu, tblView, types, list, count, tblH, tblR, tree, data, field, pop, editor, maxCols
let Q, view, hides, sorts, _sort // setting

function init(ref) {
        ready()

}

function render(ref) {
    if (!types) return <div/>
    return <div className={"dbAdm " + view}>
        <div className="top">
            <Zsvg name="clock" onClick={setDay} />
            <span className="rmableinput"><input defaultValue={q} onBlur={search2} onKeyDown={e => e.key === "Enter" && search2()} className="zinput" key={q}/><Zsvg name="x" className="rminput" onClick={() => {tree = undefined; Q = {}; selType(ALL)}} /></span>
            <button onClick={search2} className="zbtn" style={{margin:"0 5px"}}>查询</button>
            <Zsvg name="list" onClick={setting} />
        </div>
        <div className="main">
            <div style={{"margin": "0 0 6px 0"}}>{noData()}</div>
            <div className={tree ? "hasTree" : Bln}>{!!tree && rTree()}{rTable()}</div>
        </div>
        {menu && <div className="menu" style={{top: menu.top, left: menu.left}}>{menu.arr.map(a => rMenu(a))}</div>}
    </div>
}

function rTable() {
    return <table className={"ztable " + db}>
        <thead onContextMenu={contextMenu}><tr>
            {!hides.includes(_id) && <th>_id</th>}{!hides.includes("创建时间") && <th><a onClick={e => sort(e, _id)} className={sortCx(_id)} data-seq={sortSeq(_id)}>创建时间</a></th>}
            {tblH.filter(a => !hides.includes(a)).map(a => <th title={a} key={a}><a onClick={e => sort(e, a)} className={sortCx(a)} data-seq={sortSeq(a)}>{a}</a></th>)}
        </tr></thead>
        <tbody onContextMenu={contextMenu}>{list.map((o, i) => 
            <tr onClick={() => selData(o._id)} className={data && data._id === o._id ? " cur" : Bln} key={i}>
                {!hides.includes(_id) && <td>{o._id}</td>}{!hides.includes("创建时间") && <td>{new Date(parseInt(o._id.slice(0, 8), 16) * 1000).format("YYYY-MM-DD HH:mm:ss")}</td>}
                {tblH.filter(a => !hides.includes(a)).map(k => <td title={tblR[i][k] && tblR[i][k].length > 20 ? tblR[i][k] + Bln : Bln} key={k}>{tblR[i][k]}</td>)}
            </tr>)}
            <tr className={"observer" + (list.length ? Bln : " zhide")}><td colSpan="2"><strong>右键</strong>表头或单元格弹出菜单，按住<strong>Ctrl</strong>键点击表头可多列排序</td></tr>
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
        let path = parent.length ? parent.join(_) + _ + i : Bln + i
        return <div className="node" data-path={path} key={i}>
            <span onClick={switcher} className={"switcher" + (len > parent.length ? " hasChild" : Bln) + (tree.open[path] ? Bln : " close")}/>
            <span onClick={selNode} className={"txt" + (tree.sel == path ? " selected" : Bln)}>{a + Bln || "空白"}</span>
            {tree.open[path] ? rTree1(tree[path], len, parent.concat([i])) : Bln}
        </div>
    })
}

function rMenu(a) {
    if (!a.arr) return <div onClick={a.fn} title={a.title} key={a.txt}>{a.txt}</div>
    return <div onClick={a.fn} className="hasSubmenu" key={a.txt}>{a.txt}<Zsvg name="left"/><div className="menu submenu">{a.arr.map(b => <div key={b}>{b}</div>)}</div></div>
}

function noData() {
    return <div className="field">
        <div style={{"margin": "6px"}}>已加载/总数：<strong>{list.length}</strong>/<strong>{count}</strong></div>
        <div><span onClick={toDownload} className="zbtn">导出</span>
        <span onClick={dels} className="zbtn">全删</span>
        {(db === "product" || db === "xdb") && <button onClick={insert0} className="zbtn">新增</button>}
        {db === "user" && <button onClick={upsertUser} className="zbtn">新增</button>}
        {type != ALL && <span onClick={changeType} className="zbtn">更改类型</span>}</div>
    </div>
}

function hasData() {
    return <div className="field">
        <ul className="znone">{getCol().map(k => <li onClick={() => selField(k)} className={"ztab" + (k === field ? " zcur" : Bln) + (data[k] && Object.keys(data[k]).length ? " bold" : Bln)} key={k}>{k}</li>)}</ul>
        <div><button onClick={() => save(editor)} className="zbtn">保存</button></div>
    </div>
}

function getCol() {
    let arr = ["x", "y"]
    if (data.z) arr.push("z")
    if (data.wx) arr.push("wx")
    return arr
}

function ready() {
    let el = $(".observer")
    if (!el || !window.monaco) return setTimeout(() => ready(), 500)
    editor = monaco.editor.create($(".jsoneditor"), EditOpt)
    const o = new IntersectionObserver(entries => entries.forEach(a => {
        if (!a.intersectionRatio || count <= list.length) return
        if (typeof Q._id == Str) delete Q._id
        O.skip = list.length
        search(1)
    }), {})
    o.observe(el)
}

function selDB(_db) {
    db = _db
    url[4] = db
    type = ALL
    list = []
    count = 0
    tblH = []
    tblR = []
    hides = []
    sorts = [_id]
    _sort = [_id] // 倒序
    view = Views[0]
    tblView = view == Views[0]
    data = undefined
    tree = undefined
    db == "user" ? types = [ALL] : API(znod, "distinct", { model: db, field: "type", query: {} }, R => types = [ALL].concat(R.arr))
    Q = urlQuery ? JSON.parse(urlQuery) : {}
    O = { limit: 30, skip: 0 }
    search()
    const href = url.join(Slash)
    history.replaceState({ href }, null, href)
    localStorage.setItem("zinndb", db)
}


function sortCx(f) {
    return "zsort" + (sorts.includes(f) ? (_sort.includes(f) ? " desc" : " asc") : Bln)
}

function sortSeq(f) {
    return sorts.includes(f) && sorts.length > 1 ? sorts.indexOf(f) + 1 : Bln
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
    tblView ? delete O.select : O.select = "-x -y -wx"
    O.sort = sorts.map(a => _sort.includes(a) ? "-" + a : a).join(Blnk)
    API(znod, "search", { model: db, path: Bln, query: Q, option: O }, R => {
        if (!R || !R.arr) return
        list = concat == 1 ? list.concat(R.arr) : R.arr
        count = R.count
        data = undefined
        if (typeof Q.type == Str) type = Q.type
        doTblView()
        if (db == "product" || db == "order") {
            let arr = []
            R.arr.map(a => a.auth).forEach(a => {
                if (a && !arr.includes(a) && !GV.user[a]) arr.push(a)
            })
            if (arr.length) API(znod, "search", { model: "user", path: Bln, query: { _id: { $in: arr } }, option: { limit: 0, select: "x.姓名 x.name wx.nickname" } }, R => {
                R.arr.forEach(o => GV.user[o._id] = o)
            })
        }
        if (typeof cb == Fun) cb()
    })
}

function doTblView() {
    if (!tblView) return
    tblH = []
    tblR = []
    list.forEach(o => {
        let r = {}
        Fields.forEach(k => recur(r, o[k], k + Dot))
        tblR.push(r)
    })
    tblH.sort()
    if (tblH.length > 600) {
        if (!maxCols) GV.alert("共有" + tblH.length + "列", "数据量太大，仅展示前500列" + (type == ALL ? "，建议只查看某一类型的数据或切换到json视图" : ""))
        maxCols = true
        tblH = tblH.slice(0, 500)
    }
}

function recur(r, o, prefix) {
    if (!o || typeof o !== Obj) return
    Object.keys(o).forEach(k => {
        let K = prefix + k
        let v = o[k]
        if (Array.isArray(v)) {
            if (v[0] && typeof v[0] === Obj && !Array.isArray(v[0])) return v.forEach((a, i) => recur(r, a, K + Dot + i + Dot))
            if (!tblH.includes(K)) tblH.push(K)
            r[K] = JSON.stringify(v)
        } else if (v && typeof v === Obj) {
            recur(r, v, K + Dot)
        } else {
            if (!tblH.includes(K)) tblH.push(K)
            r[K] = v !== undefined && v !== null && v.toString ? v.toString() : v
        }
    })
}

function search2() {
    Q = $(".top input").value
    if (!Q) return Q = {}
    if (!Q.startsWith("{") || !Q.endsWith("}")) return GV.warn("查询条件必须是合法的json")
    Q = json(Q)
    if (typeof Q !== "object") return GV.alert("查询条件必须是合法的json")
    if (type !== ALL) Q.type = type
    O.skip = 0
    search()
}

function distinct(field, query, cb) {
    API(znod, "distinct", { model: db, field, query }, R => {
        if (R.arr.length > 110) {
            GV.warn("数据量太大, 只显示前100条(共" + R.arr.length + "条)，可通过添加查询条件限制数据量。")
            R.arr = R.arr.slice(0, 100)
        }
        cb(R.arr.filter(a => typeof a !== Obj))
    })
}

function switcher(e) {
    let path = e.target.parentElement.dataset.path
    tree.open[path] = !tree.open[path]
    if (tree[path] || !tree.open[path]) return GV.F5()
    if (path.startsWith(_)) path = path.slice(1)
    let arr = path.split(_)
    let field = tree.fields[arr.length]
    let query = clone(Q)
    tree.fields.forEach(k => delete query[k])
    let parent = arr.shift()
    query[tree.fields[0]] = tree.root[parent]
    arr.map(a => parseInt(a)).forEach((a, i) => {
        query[tree.fields[i + 1]] = tree[parent][a]
        parent += _ + a
    })
    distinct(field, query, arr => tree[path] = arr)
}

function selNode(e) {
    tree.fields.forEach(k => delete Q[k])
    let path = e.target.parentElement.dataset.path
    tree.sel = path
    if (path.startsWith(_)) path = path.slice(1)
    let arr = path.split(_)
    let field = tree.fields[arr.length]
    let parent = arr.shift()
    Q[tree.fields[0]] = tree.root[parent]
    arr.map(a => parseInt(a)).forEach((a, i) => {
        Q[tree.fields[i + 1]] = tree[parent][a]
        parent += _ + a
    })
    O.skip = 0
    search()
}

function setDay() {
    let arr = ["创建时间"]
    let type = { _id }
    const R = tblR.slice(0, 20)
    tblH.forEach(h => R.forEach(r => {
        let c = r[h]
        if (c && !arr.includes(h) && (isId(c) || !isNaN(c) || (typeof c == Str && c.endsWith("Z") && c.includes("T")))) {
            arr.push(h)
            type[h] = isId(c) ? _id : (c.endsWith("Z") ? Str : Num)
        }
    }))
    GV.modal(<div><select>{arr.map((o, i) => <option value={o} key={i}>{o}</option>)}</select>的时间范围</div>, <div>
        <input type="datetime-local" step="1" className="zinput" onKeyDown={e => e.key === "Enter" && op()}/> -&nbsp;
        <input type="datetime-local" step="1" className="zinput" onKeyDown={e => e.key === "Enter" && op()}/>
    </div>, <button className="zbtn zprimary" onClick={op}>查询</button>, "autoWidth", 1)

    function op() {
        let f = $(".zmodal select").value
        if (f == arr[0]) f = _id
        if (typeof Q[f] != Obj) Q[f] = {}
        const vals = $$(".zmodal input")
        const keyword = ["$gte", "$lte"]
        keyword.forEach((kw, i) => {
            let d = vals[i].value
            if (d) {
                d = new Date(d)
                Q[f][kw] = type[f] == _id ? oid(d) : (type[f] == Str ? d.toJSON() : d.getTime())
            } else delete Q[f][kw]
        })
        if (!Object.keys(Q[f]).length) delete Q[f]
        search()
        GV.modal()
    }
}

function setting() {
    API(znod, "inndbsetting/" + ai + Slash + db, {}, arr => {
        GV.modal("设置", <div className="inndbsetting">
            <div><span className="zbtn" onClick={op}>保存到</span><input className="zinput" placeholder="给当前设置起个名字"/></div>
            {arr.map((o, i) => <div key={i}>
                <span className="zbtn" onClick={e => op(e, o._id)}>保存到</span>
                <input className="zinput" defaultValue={o.x.name}/>
                <span className="zbtn" onClick={() => op(o.x)}>选择</span>
                <span className="zbtn" onClick={() => GV.confirm("提示", "确定要删除吗？", () => op(0, o._id))}>删除</span>
            </div>)}
        </div>)

        function op(o, _id) {
            if (_id) {
                if (o == 0) { // 删除
                    o = { _id }
                } else { // 保存
                    o = { _id, Q, view, hides, sorts, _sort, filter: tree ? tree.fields : [], name: o.target.nextSibling.value }
                    if (!o.name) return GV.warn("请填写名称")
                }
            } else if (o && o.Q && o.hides) { // 选择
                Q = o.Q
                view = o.view
                hides = o.hides
                sorts = o.sorts
                _sort = o._sort
                if (typeof Q.type == Str) type = Q.type
                tblView = view == Views[0]
                if (o.filter[0]) add2Tree(o.filter[0], o.filter)
                search()
                return GV.modal()
            } else { // 新建
                o = { Q, view, hides, sorts, _sort, filter: tree ? tree.fields : [], name: o.target.nextSibling.value }
                if (!o.name) return GV.warn("请填写名称")
            }
            API(znod, "inndbsetting/" + ai + Slash + db, o, o => {
                GV.info(o._id ? "已保存" : "已删除")
                GV.modal()
            })
        }
    })
}

function save(edit) {
    if (field != "x" && field != "y") return GV.warn("不可编辑")
    try {
        let o = JSON.parse(edit.getValue())
        API(znod, "modify/" + data._id, {
            model: db,
            updater: {
                [field]: o
            }
        }, o => {
            if (o._id) {
                data = o
                GV.success("已保存")
                if (tblView) {
                    GV.modal()
                    let idx = list.findIndex(a => a._id == o._id)
                    if (idx >= 0) {
                        list[idx] = o
                        let r = {}
                        recur(r, o.x, "x.")
                        recur(r, o.y, "y.")
                        tblR[idx] = r
                    }
                }
            } else GV.warn("保存失败")
        })
    } catch (e) { GV.alert("数据不合法", e.message) }
}

function toDownload() {
    if (count < 1000) return download_()
    GV.confirm("提示", "数据量有点大, 确定要导出" + count + "条数据吗", () => download_())
}

function download_() {
    const limit = 200
    let skip = 0
    let repeat = Array(Math.ceil(count / limit))
    let arr = []
    calls(repeat, (step, next) => {
        API(znod, "search", { model: db, path: Bln, query: Q, option: { limit, skip } }, R => {
            if (R.arr) R.arr.forEach(a => {
                delete a.sel
                arr.push(a)
            })
            GV.success("已加载" + arr.length + "条数据")
            skip = skip + limit
            next()
        })
    }, () => {
        download(db + "_" + new Date().toJSON() + ".json", { type: "biz", appid: GV.site._id, query: Q, [db]: arr })
        if (tblView) GV.confirm("Excel", "原始数据已下载，是否还需要导出到Excel？", () => UF.data2Excel(arr, null, null, db), "不用了", "需要")
    })
}

function changeType() {
    GV.modal("更改类型", <div>
        <input placeholder={type} className="zinput" onKeyDown={e => e.key === "Enter" && op()}/>
        <button className="zbtn" onClick={op}>提交</button>
    </div>, null, "autoWidth")
    setTimeout(() => $(".zmodal input").focus(), 99)

    function op() {
        const nType = $(".zmodal input").value
        API(znod, "batch/changetype", { model: db, nType, oType: type }, o => {
            o.acknowledged ? GV.success("已更改") : GV.warn("更改失败")
            GV.modal()
            search()
        })
    }
}

/* --------------------------------------------------------------------------------------------- */

function contextMenu(e) {
    e.preventDefault()
    let k, v, arr
    let col = type == ALL && db != "user" ? ["type"].concat(Cols[db].k) : Cols[db].k
    if (e.currentTarget.tagName == "THEAD") {
        k = e.target.innerText
        v = Cols[db].th.includes(k) ? Cols[db].k[Cols[db].th.indexOf(k)] : k
        arr = [
            { txt: "加到筛选树", fn: () => add2Tree(v) },
            { txt: "存在此字段", fn: filter(v) },
            { txt: "不存在此字段", fn: filter(v) },
            { txt: "批量更改值", fn: updField(k, "$set") },
            { txt: "重命名字段", fn: updField(k, "$rename") },
            { txt: "删除字段", fn: updField(k, "$unset") },
            { txt: "添加字段", fn: updField(k, "add") },
            { txt: "隐藏此字段", fn: () => hideHead(k) }
        ]
        if (type == ALL) arr.splice(0, 1)
        else if (k == _id || k == "创建时间") arr.splice(0, 6)
        if (hides.length) arr.push({ txt: "显示字段", fn: showHead, arr: hides })
    } else { // TBODY
        const colIdx = nthChild(e.target)
        const rowIdx = nthChild(e.target.parentElement)
        data = list[rowIdx]
        selData(data._id)
        k = colIdx < col.length + 2 ? (colIdx < 2 ? _id : col[colIdx - 2]) : k = tblH[colIdx - col.length - 2]
        v = getIn(data, k)
        arr = [{ txt: "编辑", fn: toEdit }, { txt: "删除", fn: del }]
        if (k == "name" && db == "product") arr.push({ txt: "修改别名", fn: updName })
        if (db == "user") {
            if (k == "role") arr.push({ txt: "修改角色", fn: updRole })
            arr = arr.concat([{ txt: "重置账号", fn: upsertUser }, { txt: "登录历史", fn: login }], { txt: "登出各设备", fn: logout })
        }
        if (db == "order") arr.push(data.z ? { txt: "退款", fn: refund } : { txt: "同步订单", fn: syncOrder, title: "查询最新支付状态并同步到数据库" })
        if (db === "product" || db === "xdb") arr.push({ txt: "模板数据", fn: insert1, title: "作为模板插入新数据" })
        if (v != undefined && v != null) {
            let a = ["等于", "不等于"]
            if (typeof v == Num) a = a.concat(["大于或等于", "小于或等于"])
            if (typeof v == Str && !isId(v)) a = a.concat(["包含", "不包含", "开头是", "末尾是"])
            arr.splice(0, 0, { txt: "查询条件", fn: filter(k, v), arr: a })
        }
    }
    if (k != _id && typeof v == Str) {
        Separator.forEach(s => {
            if (v.includes(s)) v = v.split(s).find(v => v.length == 24) || v
        })
        if (v.length > 24) v = v.slice(0, 24)
        if (isId(v)) arr.splice(0, 0, { txt: "查询此_id", fn: () => openId(v) })
    }
    menu = { arr, top: e.clientY - (innerHeight - e.clientY > 120 ? 16 : 180) + "px", left: e.clientX - (innerWidth - e.clientX > 120 ? 20 : 100) + "px" }
    document.addEventListener("click", hideMenu)
    GV.F5()
}

function hideMenu(e) {
    menu = undefined
    GV.F5()
    document.removeEventListener("click", hideMenu)
}

function nthChild(el) {
    let i = 0
    while ((el = el.previousElementSibling) != null) i++
    return i
}

const filter = (k, v) => e => {
    const btn = e.target.innerText
    let V = { 存在此字段: { $exists: true }, 不存在此字段: { $exists: false }, 等于: v, 不等于: { $ne: v }, 大于或等于: { $gte: v }, 小于或等于: { $lte: v }, 包含: { $regex: v + Bln }, 不包含: { $not: { $regex: v + Bln } }, 开头是: { $regex: "^" + v }, 末尾是: { $regex: v + "$" } }
    V = V[btn]
    if (typeof Q._id == Str) delete Q._id
    btn != "等于" && typeof Q[k] == Obj ? Object.assign(Q[k], V) : Q[k] = V
    search()
}

function toEdit(f) {
    if (typeof f != Str) f = "x"
    if (pop && $(".zmodal-bd")) {
        pop.setValue(data[f] ? JSON.stringify(data[f], null, "\t") : Empty)
    } else {
        GV.modal(<ul className="znone">{["x", "y"].map(k => <li onClick={() => toEdit(k)} className="ztab" key={k}>{k}</li>)}</ul>, null, <button onClick={() => save(pop)} className="zbtn zprimary">提交</button>, "full")
        setTimeout(() => pop = monaco.editor.create($(".zmodal-bd"), Object.assign({ value: data[f] ? JSON.stringify(data[f], null, "\t") : Empty }, EditOpt)), 99)
    }
    setTimeout(() => {
        let el = $(".zmodal-hd ul")
        Array.from(el.children).forEach(a => a.classList.remove("zcur"))
        el.children[f == "x" ? 0 : 1].classList.add("zcur")
    }, 99)
}

const updField = (k, op) => () => {
    if ((k == _id || k == "name") && op != "add") return GV.warn("不可更改")
    if ((op == "$rename" || op == "$unset") && !k.startsWith("x.") && !k.startsWith("y.")) return GV.warn("不可更改")
    search(null, () => {
        let type = "字符串"
        const save = () => {
            let O = { model: db, query: Q, updater: {} }
            let vals = $$(".zmodal input")
            let v1 = vals[0] ? vals[0].value : Bln
            let v2 = vals[1] ? vals[1].value : Bln
            if (!v1) return GV.warn("请输入字段名")
            if (!v1.startsWith("x.") && !v1.startsWith("y.")) v1 = "x." + v1
            if (op == "add") {
                if (type != "字符串") v2 = type == "数字" ? parseFloat(v2) : JSON.parse(v2)
                O.updater.$set = {}
                O.updater.$set[v1] = v2
            } else {
                O.updater[op] = {}
                if (L[7] && type != "字符串") v2 = type == "数字" ? parseFloat(v2) : JSON.parse(v2)
                O.updater[op][v1] = v2
            }
            API(znod, "batch/modify", O, o => {
                GV.success("已更新" + o.modifiedCount + "条数据")
                GV.modal()
                search()
            })
        }
        const Label = { // [title, label1, value1, placeholder1, label2, value2, placeholder2, type]
            $set: ["批量更改值", "字段名", k, Bln, "值", Bln, Bln, 1],
            $rename: ["重命名字段", "当前字段名", k, Bln, "新字段名", k, "默认放在【x】下"],
            $unset: ["删除字段", "字段名", k],
            add: ["添加字段", "新字段名", Bln, "默认放在【x】下", "值", Bln, Bln, 1]
        }
        const L = Label[op]
        let body = <div className="horizon">
            {<label><span>{L[1]}</span><Input className="zinput" value={L[2]} placeholder={L[3]} /></label>}
            {!!L[4] && <label><span>{L[4]}</span><Input className="zinput" value={L[5]} placeholder={L[6]} /></label>}
            {!!L[7] && <label><span>类型</span><Radio value={type} onChange={v => type = v}>{["字符串", "数字", "布尔值", "对象"]}</Radio></label>}
        </div>
        GV.modal(L[0], body, <div>
            <span style={{margin: "0 20px"}}>共 <strong style={{color:"red", fontSize: "larger"}}>{count}</strong> 条数据符合查询条件，建议提交前先导出备份。</span>
            <button onClick={() => save()} className="zbtn zprimary">提交</button>
        </div>)
        L[1] && setTimeout(() => $(".zmodal input").focus(), 9)
    })
}

function openId(_id) {
    API(znod, "idinwhichdb", { _id }, o => window.open("/app/" + o.ai + "/inndb/" + o.db + "?Q=" + JSON.stringify({ _id })))
}

function add2Tree(field, fields = [field]) {
    if (tree) {
        tree.fields.push(field)
        return GV.F5()
    }
    distinct(field, Q, root => tree = { fields, root, open: {} })
}

function hideHead(v) {
    hides.push(v)
    GV.F5()
}

function showHead(e) {
    const i = Array.from(e.currentTarget.lastChild.children).indexOf(e.target)
    hides.splice(i, 1)
    GV.F5()
}

function updName() {
    GV.modal("修改别名", <div>
        <input defaultValue={data.name} className="zinput" onKeyDown={e => e.key === "Enter" && op()}/>
        <button className="zbtn" onClick={op}>修改</button>
    </div>, null, "autoWidth")
    setTimeout(() => $(".zmodal input").focus(), 99)

    function op() {
        const name = $(".zmodal input").value
        API(znod, "product/setname/" + data._id, { name }, o => {
            o._id ? GV.success("已更改") : GV.warn("更改失败")
            GV.modal()
            selType()
        })
    }
}

function upsertUser() {
    GV.modal(data ? "重置账号" : "添加新用户", <div className="horizon">
        <label><span>手机</span><input defaultValue={data ? data.phone : Bln} className="zinput phone" /></label>
        <label><span>邮箱</span><input defaultValue={data ? data.mail : Bln} className="zinput mail" /></label>
        <label><span>密码</span><input className="zinput zpw" /></label>        
    </div>, <button className="zbtn zprimary" onClick={op}>提交</button>)
    setTimeout(() => $(".zmodal input").focus(), 99)

    function op() {
        API(znod, data ? "user/reset/" + data._id : "/user/create", { phone: $(".zmodal .phone").value, mail: $(".zmodal .mail").value, zpw: $(".zmodal .zpw").value }, o => {
            if (!o._id) return GV.warn(data ? "更改失败" : "创建失败")
            GV.success(data ? "已更改" : "已创建")
            data && tblView ? Object.assign(data, o) : selData(o._id)
            GV.modal()
            if (!data) search()
        })
    }
}

function syncOrder() {
    API(znod, "pay/syncorder/" + data._id, {}, o => {
        if (!o) return GV.warn("未支付")
        data = o
        GV.success("已支付")
    })
}

function refund(sum, reason) {
    GV.modal("退款", <div className="horizon">
        <label><span>退款金额</span><input defaultValue={data.total - (data.refund || 0)} type="number" className="zinput sum" /></label>
        <label><span>退款说明</span><input className="zinput reason" /></label>        
    </div>, <button className="zbtn" onClick={op}>提交</button>)
    setTimeout(() => $(".zmodal input").focus(), 99)

    function op() {
        const sum = parseFloat($(".zmodal .sum").value)
        const reason = $(".zmodal .reason").value
        if (typeof sum != Num || !reason) return GV.warn("输入不正确")
        API(znod, "pay/refund", { _id: data._id, sum, reason }, o => {
            if (!o) return GV.warn("提交失败")
            data = o
            GV.modal()
            GV.success(o.message || "正在处理")
        })
    }
}

function insert0() {
    let o = { type: Bln, key: db == "xdb" ? Bln : undefined, x: {} }
    if (type != ALL) o.type = type
    insert(o)
}

function insert1() {
    let o = clone(data)
    delete o._id
    delete o.auth
    delete o.sel
    delete o.y
    insert(o)
}

function insert(o) {
    GV.modal("插入新数据", null, <button onClick={insert3} className="zbtn zprimary">提交新数据</button>, "full")
    setTimeout(() => pop = monaco.editor.create($(".zmodal-bd"), Object.assign({ value: JSON.stringify(o, null, "\t") }, EditOpt)), 99)
}

function insert3() {
    try {
        const o = JSON.parse(pop.getValue())
        GV.confirm("注意", "确定要插入新数据吗?", () => {
            API(znod, db + "/create", { type: o.type, key: o.key, x: o.x }, o => {
                GV.modal()
                search()
            })
        })
    } catch (e) { GV.alert("数据不合法", e.message) }
}

function del() {
    GV.confirm("危险", "确定要删除吗? 数据不可恢复!", () => {
        API(znod, db + "/delete/" + data._id, {}, o => {
            o._id || o.deletedCount ? GV.success("已删除") : GV.warn("删除失败")
            selType()
        })
    })
}

function dels() {
    GV.confirm("危险", "将会批量删除此查询条件下的所有数据? 共有" + count + "条数据!", () => {
        GV.confirm("确定要彻底删除吗? 数据不可恢复!", "建议先导出/备份数据以防后悔！", () => {
            API(znod, "batch/deletes", { model: db, query: Q }, o => {
                o.acknowledged ? GV.success("已删除") : GV.warn("删除失败")
                search()
            })
        })
    })
}

const Separator = ["_", " " , ".", ":", "#", "|", ","]



const css = `
.zp999 {
    color: red;
}
`

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