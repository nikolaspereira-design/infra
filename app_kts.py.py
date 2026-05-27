import tkinter as tk
from tkinter import ttk, messagebox, filedialog
import math
import csv
import sys
import os
from datetime import datetime

try:
    from PIL import Image, ImageTk
    HAS_PIL = True
except ImportError:
    HAS_PIL = False

try:
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.utils import ImageReader
    from reportlab.pdfgen import canvas
    from reportlab.lib import colors
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    HAS_REPORTLAB = True
except ImportError:
    HAS_REPORTLAB = False

# FUNÇÃO MÁGICA: Permite que o .exe encontre a imagem embutida nele
def resource_path(relative_path):
    try:
        base_path = sys._MEIPASS
    except Exception:
        base_path = os.path.abspath(os.path.dirname(__file__))
    return os.path.join(base_path, relative_path)

class AppKTS(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("KTS Tecnologia & Inovação - Sistema de Dimensionamento")
        self.geometry("1200x800")
        self.configure(bg="#f4f6f8")

        self.itens_projeto = []
        self.materiais_consolidados = {}
        self.logo_image = self.load_logo("logo_kts.jpeg", (130, 60))

        # --- CABEÇALHO ---
        header = tk.Frame(self, bg="#1e3a5f", height=90)
        header.pack(fill="x", side="top")
        if self.logo_image:
            tk.Label(header, image=self.logo_image, bg="#1e3a5f").pack(side="left", padx=15, pady=12)
        titulo = tk.Label(header, text="KTS - DIMENSIONAMENTO DE INFRAESTRUTURA", fg="white", bg="#1e3a5f", font=("Arial", 16, "bold"), anchor="w", justify="left")
        titulo.pack(side="left", padx=(5, 20), pady=15)

        # --- LAYOUT PRINCIPAL ---
        main_frame = tk.Frame(self, bg="#f4f6f8")
        main_frame.pack(fill="both", expand=True, padx=15, pady=15)

        # 1. MENU LATERAL
        menu_container = tk.Frame(main_frame, width=320, bg="white", relief="groove", bd=2)
        menu_container.pack(side="left", fill="y", padx=(0, 15))
        menu_container.pack_propagate(False)
        
        btn_importar = tk.Button(menu_container, text="📂 Importar Base de Parâmetros", bg="#28a745", fg="white", font=("Arial", 9, "bold"), pady=5, command=self.importar_planilha_base)
        btn_importar.pack(side="top", fill="x", padx=10, pady=10)

        btn_ver_lista = tk.Button(menu_container, text="📋 GERAR LISTA", bg="#cc0000", fg="white", font=("Arial", 11, "bold"), pady=10, command=self.mostrar_painel_resumo)
        btn_ver_lista.pack(side="bottom", fill="x", padx=10, pady=10)

        canvas_menu = tk.Canvas(menu_container, bg="white", highlightthickness=0)
        scrollbar = ttk.Scrollbar(menu_container, orient="vertical", command=canvas_menu.yview)
        self.menu_lateral = tk.Frame(canvas_menu, bg="white")
        
        self.menu_lateral.bind("<Configure>", lambda e: canvas_menu.configure(scrollregion=canvas_menu.bbox("all")))
        canvas_menu.create_window((0, 0), window=self.menu_lateral, anchor="nw", width=290)
        canvas_menu.configure(yscrollcommand=scrollbar.set)
        
        scrollbar.pack(side="right", fill="y")
        canvas_menu.pack(side="left", fill="both", expand=True, padx=5)

        # --- PREENCHIMENTO DO MENU ---
        self.add_categoria("ELETRODUTOS 3/4\"")
        self.add_subitem("Eletroduto 3/4\" - Concreto", "ELETRODUTO_34_CONCRETO")
        self.add_subitem("Eletroduto 3/4\" - Drywall", "ELETRODUTO_34_DRYWALL")
        self.add_subitem("Eletroduto 3/4\" - Metálica", "ELETRODUTO_34_METALICA")
        
        self.add_categoria("ELETRODUTOS 1\"")
        self.add_subitem("Eletroduto 1\" - Concreto", "ELETRODUTO_1_CONCRETO")
        self.add_subitem("Eletroduto 1\" - Drywall", "ELETRODUTO_1_DRYWALL")
        self.add_subitem("Eletroduto 1\" - Metálica", "ELETRODUTO_1_METALICA")

        self.add_categoria("ELETRODUTOS 2\"")
        self.add_subitem("Eletroduto 2\" - Concreto", "ELETRODUTO_2_CONCRETO")
        self.add_subitem("Eletroduto 2\" - Drywall", "ELETRODUTO_2_DRYWALL")
        self.add_subitem("Eletroduto 2\" - Metálica", "ELETRODUTO_2_METALICA")

        self.add_categoria("DUTOS ENTERRADOS")
        self.add_subitem("Dutos Enterrados (3/4\", 1\", 2\")", "DUTOS_ENTERRADOS")

        self.add_categoria("ELETROCALHA 100X50")
        self.add_subitem("Eletrocalha - Mão Francesa", "CALHA_MF_CONCRETO")
        self.add_subitem("Eletrocalha - Suspensa Cabo de Aço", "CALHA_CABO")
        self.add_subitem("Eletrocalha - Igrejinha + Barra", "CALHA_IGREJINHA")
        self.add_subitem("Eletrocalha - Grampo C", "CALHA_GRAMPO")

        self.add_categoria("PERFILADO 38X38")
        self.add_subitem("Perfilado - Mão Francesa", "PERFILADO_MF_CONCRETO")
        self.add_subitem("Perfilado - Grampo C + Balancim", "PERFILADO_GRAMPO")
        self.add_subitem("Perfilado - Chumbador + Barra", "PERFILADO_BARRA")

        # 2. ÁREA CENTRAL
        self.area_trabalho = tk.Frame(main_frame, bg="white", relief="groove", bd=2)
        self.area_trabalho.pack(side="right", fill="both", expand=True)
        self.mostrar_tela_boas_vindas()

    def load_logo(self, filename, size=None):
        if not HAS_PIL:
            return None
        try:
            path = resource_path(filename)
            image = Image.open(path)
            if size:
                image = image.resize(size, Image.LANCZOS)
            return ImageTk.PhotoImage(image)
        except Exception:
            return None

    def load_pdf_image(self, filename):
        try:
            path = resource_path(filename)
            return ImageReader(path)
        except Exception:
            return None

    def importar_planilha_base(self):
        filepath = filedialog.askopenfilename(title="Selecione a Planilha", filetypes=[("Excel", "*.xlsx *.xls")])
        if filepath:
            messagebox.showinfo("Sucesso", "Base de dados mapeada com sucesso!")

    def add_categoria(self, texto):
        lbl = tk.Label(self.menu_lateral, text=texto, bg="#ffb000", fg="black", font=("Arial", 9, "bold"), pady=3)
        lbl.pack(fill="x", pady=(10, 2))

    def add_subitem(self, texto, codigo_tipo):
        btn = tk.Button(self.menu_lateral, text=f"  {texto}", bg="#1e3a5f", fg="white", font=("Arial", 9), anchor="w", relief="flat")
        btn.configure(command=lambda: self.abrir_formulario_input(texto, codigo_tipo))
        btn.pack(fill="x", pady=1, padx=2)

    def mostrar_tela_boas_vindas(self):
        for widget in self.area_trabalho.winfo_children(): widget.destroy()
        if self.logo_image:
            tk.Label(self.area_trabalho, image=self.logo_image, bg="white").pack(pady=(40, 10))
        msg = "SISTEMA DE DIMENSIONAMENTO KTS\n\n1. Selecione a infraestrutura no menu lateral.\n2. Adicione os trechos do projeto.\n3. Clique em GERAR LISTA para exportar em PDF/Excel."
        tk.Label(self.area_trabalho, text=msg, font=("Arial", 14), fg="gray", bg="white", justify="center", wraplength=680).pack(expand=True, padx=40)

    def abrir_formulario_input(self, nome_infra, codigo_tipo):
        for widget in self.area_trabalho.winfo_children(): widget.destroy()
        
        tk.Label(self.area_trabalho, text=f"Lançamento: {nome_infra}", font=("Arial", 14, "bold"), bg="white", fg="#1e3a5f").pack(pady=20, anchor="w", padx=20)
        form_frame = tk.Frame(self.area_trabalho, bg="white")
        form_frame.pack(fill="both", expand=True, padx=20)

        entradas = {}
        def criar_campo(texto, key, default="0", row=0):
            tk.Label(form_frame, text=texto, font=("Arial", 10), bg="white").grid(row=row, column=0, sticky="w", pady=5)
            ent = tk.Entry(form_frame, font=("Arial", 10), width=15)
            ent.insert(0, default)
            ent.grid(row=row, column=1, sticky="w", pady=5, padx=10)
            entradas[key] = ent

        if "DUTOS_ENTERRADOS" in codigo_tipo:
            criar_campo("Metros Duto PEAD 3/4\":", "m_34", "0", 0)
            criar_campo("Metros Duto PEAD 1\":", "m_1", "0", 1)
            criar_campo("Metros Duto PEAD 2\":", "m_2", "0", 2)
            criar_campo("Caixas de Passagem (Concreto):", "caixas", "0", 3)
        else:
            criar_campo("Comprimento (Metros):", "metros", "0", 0)
            criar_campo("Curvas 90º:", "curvas", "0", 1)
            
            if "CALHA" in codigo_tipo or "PERFILADO" in codigo_tipo:
                criar_campo("Emendas Adicionais:", "emendas", "0", 2)
                criar_campo("Apoios Adicionais:", "apoios", "0", 3)
                if "CABO" in codigo_tipo: criar_campo("Altura Susp. (Metros):", "altura", "4", 4)
                if "IGREJINHA" in codigo_tipo or "BARRA" in codigo_tipo: criar_campo("Queda Tirante (Metros):", "altura", "0.5", 4)
            else:
                criar_campo("Conduletes Adicionais:", "conduletes", "0", 2)

        def salvar_trecho():
            try:
                dados = {"tipo": codigo_tipo, "nome": nome_infra}
                for k, v in entradas.items(): dados[k] = float(v.get())
                self.itens_projeto.append(dados)
                messagebox.showinfo("Sucesso", f"Trecho adicionado! Total: {len(self.itens_projeto)}")
                self.mostrar_tela_boas_vindas()
            except ValueError:
                messagebox.showerror("Erro", "Insira valores numéricos.")

        tk.Button(self.area_trabalho, text="➕ Adicionar Trecho", bg="#28a745", fg="white", font=("Arial", 11, "bold"), padx=15, pady=8, command=salvar_trecho).pack(pady=30)

    def arredondar_miudezas(self, valor_base):
        if valor_base == 0: return 0
        sup = math.ceil(valor_base * 1.10)
        while sup % 5 != 0: sup += 1
        return sup

    def processar_materiais_finais(self):
        c = {}
        def add(n, q, t="principal", u="PEÇA"):
            if q > 0:
                if n not in c: c[n] = {"qtd": 0, "tipo": t, "und": u}
                c[n]["qtd"] += q

        for tr in self.itens_projeto:
            tipo = tr["tipo"]

            if type(tr) == dict and tipo == "DUTOS_ENTERRADOS":
                add("DUTO CORRUGADO PEAD 3/4\"", tr.get("m_34", 0), "principal", "METRO")
                add("DUTO CORRUGADO PEAD 1\"", tr.get("m_1", 0), "principal", "METRO")
                add("DUTO CORRUGADO PEAD 2\"", tr.get("m_2", 0), "principal", "METRO")
                cx = tr.get("caixas", 0)
                add("CAIXA DE PASSAGEM CONCRETO 50X50", cx)
                add("TAMPA PARA CAIXA DE INSPEÇÃO COM ALÇA", cx)
                continue

            m = tr.get("metros", 0)
            cur = tr.get("curvas", 0)
            
            if "ELETRODUTO" in tipo:
                pol = "3/4" if "34" in tipo else "1\"" if "1_" in tipo else "2\""
                add(f"ELETRODUTO GALVANIZADO LEVE {pol} (BARRA 3m)", math.ceil(m/3))
                abr = math.ceil(m/1.5)
                add(f"ABRAÇADEIRA {pol} COM CUNHA", abr)
                cond = 2 + tr.get("conduletes", 0)
                add(f"CONDULETE MÚLTIPLO X {pol}", cond)
                if cur > 0: add(f"CURVA 90º ELETRODUTO {pol}", cur)
                
                fix = abr + (cond * 2)
                if "CONCRETO" in tipo:
                    add("BUCHA FISCHER SX 8MM", fix, "miudeza")
                    add("PARAFUSO PHILLIPS PANELA", fix, "miudeza")
                elif "DRYWALL" in tipo:
                    add("BUCHA FLY 8MM", fix, "miudeza")
                    add("PARAFUSO PHILLIPS PANELA", fix, "miudeza")
                elif "METALICA" in tipo:
                    add("PARAFUSO AUTOBROCANTE 5/16", fix, "miudeza")

            elif "CALHA" in tipo or "PERFILADO" in tipo:
                is_calha = "CALHA" in tipo
                nome_base = "ELETROCALHA 100X50 (BARRA 3m)" if is_calha else "PERFILADO 38X38 (BARRA 6m)"
                divisor = 3 if is_calha else 6
                
                barras = math.ceil(m/divisor)
                add(nome_base, barras)
                emendas = barras + tr.get("emendas", 0)
                if is_calha: add("EMENDA INTERNA U 100X50", emendas)
                else: add("EMENDA INTERNA PERFILADO 38X38", emendas)
                
                apoios = math.ceil(m/1.5) + tr.get("apoios", 0)
                pf_base = emendas * 8
                
                if "MF" in tipo:
                    add("MÃO FRANCESA DE PERFILADO 30 CM", apoios)
                    add("BUCHA FISCHER SX 8MM", apoios * 4, "miudeza")
                    add("PARAFUSO PHILLIPS PANELA", apoios * 4, "miudeza")
                    pf_base += (apoios * 2)
                
                elif "CABO" in tipo:
                    add("SUPORTE SUSPENSO POR CABO DE AÇO", apoios)
                    add("CABO DE AÇO 1/8", apoios * tr.get("altura", 4), "principal", "METRO")
                    add("PRENSA CABO DE ALUMINIO 1/8", apoios * 6)
                
                elif "IGREJINHA" in tipo or "BARRA" in tipo:
                    if is_calha: add("SUPORTE BALANÇO (IGREJINHA)", apoios)
                    else: add("GRAMPO C COM BALANCIM", apoios)
                    add("CHUMBADOR CBA 3/8", apoios)
                    add("BARRA ROSCADA ZINCADA 3/8 X 3000", (apoios * tr.get("altura", 0.5))/3)
                    add("PORCA SEXTAVADA 3/8", apoios * 4, "miudeza")
                    add("ARRUELA LISA 3/8", apoios * 4, "miudeza")
                
                elif "GRAMPO" in tipo:
                    add("GRAMPO C COM BALANCIM", apoios)
                
                add("PARAFUSO (LENTILHA) 1/4 x 3/4", pf_base, "miudeza")
                add("PORCA SEXTAVADA 1/4", pf_base, "miudeza")
                add("ARRUELA LISA 1/4", pf_base, "miudeza")

        for n, d in c.items():
            d["qtd_final"] = self.arredondar_miudezas(d["qtd"]) if d["tipo"] == "miudeza" else math.ceil(d["qtd"])
        
        self.materiais_consolidados = c
        return c

    def mostrar_painel_resumo(self):
        if not self.itens_projeto:
            messagebox.showwarning("Aviso", "O projeto está vazio. Adicione um trecho primeiro.")
            return

        for widget in self.area_trabalho.winfo_children(): widget.destroy()
        tk.Label(self.area_trabalho, text="📋 LISTA CONSOLIDADA DE MATERIAIS", font=("Arial", 14, "bold"), bg="white", fg="#cc0000").pack(pady=10, anchor="w", padx=20)

        colunas = ("descricao", "unidade", "quantidade")
        tabela = ttk.Treeview(self.area_trabalho, columns=colunas, show="headings", height=18)
        tabela.heading("descricao", text="DESCRICÃO DO MATERIAL")
        tabela.heading("unidade", text="UNID")
        tabela.heading("quantidade", text="QTD FINAL")
        tabela.column("descricao", width=500); tabela.column("unidade", width=60, anchor="center"); tabela.column("quantidade", width=150, anchor="center")

        for nome, dados in self.processar_materiais_finais().items():
            tabela.insert("", "end", values=(nome, dados["und"], dados["qtd_final"]))
        tabela.pack(fill="both", expand=True, padx=20, pady=5)

        f_btn = tk.Frame(self.area_trabalho, bg="white")
        f_btn.pack(fill="x", padx=20, pady=15)
        tk.Button(f_btn, text="💾 Exportar para Excel (.csv)", bg="#1e3a5f", fg="white", font=("Arial", 10, "bold"), padx=10, command=self.exportar_csv).pack(side="left", padx=5)
        tk.Button(f_btn, text="📄 Exportar para PDF", bg="#cc0000", fg="white", font=("Arial", 10, "bold"), padx=10, command=self.exportar_pdf).pack(side="left", padx=5)
        tk.Button(f_btn, text="🗑️ Limpar Projeto", bg="#6c757d", fg="white", font=("Arial", 10), command=lambda: [self.itens_projeto.clear(), self.mostrar_tela_boas_vindas()]).pack(side="right", padx=5)

    def exportar_csv(self):
        if not self.materiais_consolidados:
            messagebox.showwarning("Aviso", "Nenhum material calculado para exportar.")
            return
        filepath = filedialog.asksaveasfilename(defaultextension=".csv", filetypes=[("CSV", "*.csv")], title="Guardar", initialfile="Lista_KTS.csv")
        if filepath:
            with open(filepath, 'w', newline='', encoding='utf-8-sig') as f:
                writer = csv.writer(f, delimiter=';')
                writer.writerow(["DESCRIÇÃO", "UNIDADE", "QUANTIDADE FINAL"])
                for n, d in self.materiais_consolidados.items(): writer.writerow([n, d["und"], d["qtd_final"]])
            messagebox.showinfo("Sucesso", "Exportado com sucesso!")

    def exportar_pdf(self):
        if not HAS_REPORTLAB:
            messagebox.showerror("Erro", "Instale o reportlab no terminal: pip install reportlab")
            return
        if not self.materiais_consolidados:
            messagebox.showwarning("Aviso", "Nenhum material calculado para exportar.")
            return
        filepath = filedialog.asksaveasfilename(defaultextension=".pdf", filetypes=[("PDF", "*.pdf")], initialfile=f"Relatorio_{datetime.now().strftime('%Y%m%d')}.pdf")
        if filepath:
            try:
                doc = SimpleDocTemplate(filepath, pagesize=A4, rightMargin=30, leftMargin=30, topMargin=30, bottomMargin=30)
                elementos = []
                
                estilos = getSampleStyleSheet()
                estilo_titulo = ParagraphStyle('T_KTS', parent=estilos['Heading2'], textColor=colors.HexColor("#1e3a5f"), fontSize=14, leading=16)
                estilo_sub = ParagraphStyle('S_KTS', parent=estilos['Normal'], fontSize=9, textColor=colors.gray)
                header_image = self.load_pdf_image("header_kts.jpeg") or self.load_pdf_image("logo_kts.jpeg")
                footer_image = self.load_pdf_image("footer_kts.jpeg") or self.load_pdf_image("logo_kts.jpeg")
                watermark_image = self.load_pdf_image("logo_kts.jpeg")
                top_margin = 30 if not header_image else 110
                bottom_margin = 30 if not footer_image else 80
                doc = SimpleDocTemplate(filepath, pagesize=A4, rightMargin=30, leftMargin=30, topMargin=top_margin, bottomMargin=bottom_margin)
                
                elementos.append(Paragraph("KTS TECNOLOGIA & INOVAÇÃO - LISTA DE MATERIAIS", estilo_titulo))
                elementos.append(Paragraph(f"Gerado em: {datetime.now().strftime('%d/%m/%Y %H:%M')}", estilo_sub))
                elementos.append(Spacer(1, 10))
                
                dados_tabela = [["DESCRIÇÃO DO MATERIAL", "UNID", "QUANTIDADE"]]
                for nome, dados in self.materiais_consolidados.items():
                    dados_tabela.append([nome, dados["und"], str(dados["qtd_final"])])
                    
                t = Table(dados_tabela, colWidths=[380, 55, 100])
                t.setStyle(TableStyle([
                    ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#1e3a5f")),
                    ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
                    ('ALIGN', (0,0), (-1,-1), 'CENTER'),
                    ('ALIGN', (0,1), (0,-1), 'LEFT'),
                    ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
                    ('FONTSIZE', (0,0), (-1,-1), 9), 
                    ('GRID', (0,0), (-1,-1), 0.5, colors.silver),
                    ('TOPPADDING', (0,0), (-1,-1), 4),
                    ('BOTTOMPADDING', (0,0), (-1,-1), 4),
                    ('BACKGROUND', (0,1), (-1,-1), colors.HexColor("#f8f9fa"))
                ]))
                elementos.append(t)

                def desenhar_pagina(canvas_obj, doc_obj):
                    canvas_obj.saveState()
                    try:
                        page_w, page_h = A4
                        if header_image:
                            header_height = 70
                            canvas_obj.drawImage(header_image, 0, page_h - header_height, width=page_w, height=header_height, preserveAspectRatio=True, mask='auto')
                        if footer_image:
                            footer_height = 50
                            canvas_obj.drawImage(footer_image, 0, 0, width=page_w, height=footer_height, preserveAspectRatio=True, mask='auto')
                        if watermark_image:
                            largura_img, altura_img = 400, 180
                            x = (page_w - largura_img) / 2
                            y = (page_h - altura_img) / 2
                            try:
                                canvas_obj.setFillAlpha(0.12)
                                canvas_obj.setStrokeAlpha(0.12)
                            except Exception:
                                pass
                            canvas_obj.drawImage(watermark_image, x, y, width=largura_img, height=altura_img, preserveAspectRatio=True, mask='auto')
                    except Exception:
                        pass
                    canvas_obj.restoreState()

                doc.build(elementos, onFirstPage=desenhar_pagina, onLaterPages=desenhar_pagina)
                messagebox.showinfo("Sucesso", "PDF gerado com sucesso!")
            except Exception as e:
                messagebox.showerror("Erro", f"Erro no PDF: {str(e)}")

if __name__ == "__main__":
    app = AppKTS()
    app.mainloop()