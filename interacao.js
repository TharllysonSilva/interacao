$( document ).ready(function() {
	var drop 	= $('#drop'),
		input	= $('#fl_in');

	drop.on('dragenter',function(e){
		e.stopPropagation();
		e.preventDefault();
		e.dataTransfer = e.originalEvent.dataTransfer
		e.dataTransfer.dropEffect = 'copy';
	})
	
	drop.on('dragover',function(e){
		//output.text('Carregando ....');
		e.stopPropagation();
		e.preventDefault();
		e.dataTransfer = e.originalEvent.dataTransfer
		e.dataTransfer.dropEffect = 'copy';
	})
	
	drop.on('drop',function(e){
		var bprogresso  = $('#barraProgesso');
		bprogresso.text(0);
		bprogresso.width("0%");
		
		e.stopPropagation();
		e.preventDefault();
		e.dataTransfer = e.originalEvent.dataTransfer
		var a = e.dataTransfer.files;
		do_file(e.dataTransfer.files);
	})
	drop.click(function(){
		input.trigger('click');
	})
	input.change(function(e){
		do_file(e.target.files);
	})

	
});
var global_wb;

var X 		= XLSX;
var XW 		= {msg: 'xlsx',worker: './api/excel/xlsxworker.js'};

var process_wb = (function() {
	var saida = $('#htmlout');
	
	var to_json = function to_json(workbook) {
		var result = [];
		
		workbook.SheetNames.forEach(function(sheetName) {
			var roa 	 = X.utils.sheet_to_json(workbook.Sheets[sheetName], {header:1}),
				index	 = [],
				itenAdd  = [],
				referencia = null;
				
				
			roa.forEach(function(vl,ps){
				var item = [];
				vl.forEach(function(ct){
					if(ct != '' && ct != undefined){
						conteudo = ct.split(' - ');
						item.push(conteudo[0]);
					}
				})
				if(item.length > 0){
					result.push(item);
					item = [];
				}
			});
			
		});
		return result;
	};

	return function process_wb(wb) {
		global_wb = wb;
		var output = to_json(wb);
		ps_enviar(output);
	};
	
})();

var do_file = (function() {
	
	var rABS		= typeof FileReader !== "undefined" && (FileReader.prototype||{}).readAsBinaryString;
	var use_worker	= typeof Worker		!== 'undefined';

	var xw = function xw(data, cb) {
		var worker = new Worker(XW.worker);
		worker.onmessage = function(e) {
			switch(e.data.t) {
				case 'ready': break;
				case 'e': console.error(e.data.d); break;
				case XW.msg: cb(JSON.parse(e.data.d)); break;
			}
		};
		worker.postMessage({d:data,b:rABS?'binary':'array'});
		
	};

	return function do_file(files) {
		var f 		= files[0];
		var reader 	= new FileReader();
		reader.onload = function(e) {
			var data = e.target.result;
			if(!rABS) data = new Uint8Array(data);
			if(use_worker) xw(data, process_wb);
			else process_wb(X.read(data, {type: rABS ? 'binary' : 'array'}));
		};
		if(rABS) reader.readAsBinaryString(f);
		else reader.readAsArrayBuffer(f);
	};
})();

var ps_enviar = (function(){
	var totalRegistro	= 0;
	var progressoAtual	= 0;
	var numeroDeErro	= 0;
	var returnExcel		= 'Matrícula;Nome;CPF;Parcela Nº;Valor Pago;Valor Devido;Valor Coparticipação;Data Pgto;Data Crédito;Nº da Prestação;Retorno\r\n';
	var output			= $('#htmlout');
	var layout			= 'Data Movimento,CPF,Nome,Contrato,Data Vencimento da Prestação,Código FIES,Prestação,Tipo Lançamento,Coparticipação,Multa,Mora,Total';
	
	function enviar(valor){
		$.ajax({
			type: "POST",  
			url: "comando/fies/response.php",  
			data: valor,
			dataType: "json",       
			success: function(response){
				if(output.text()=='Log do Resultado'){output.text('');}
				
				if(response['status'] == 0){
					output.append('<span style="color:red;">'+response['mensagem']+'</span><br>');
					returnExcel = returnExcel+response['conteudo']+';'+response['mensagem']+"\r\n";
					addProgesso(1);
				}else{
					output.append('<span style="color:green;" >'+response['mensagem']+'</span><br>');
					returnExcel = returnExcel+response['conteudo']+';'+response['mensagem']+"\r\n";
					addProgesso(0);
				}			
			},
			error: function (error) {
				console.log(error);
			}
		});
	}
	
	function addProgesso(erro){
		erro = (erro !== undefined) ? erro : 0;
		progressoAtual += 1;
		numeroDeErro = numeroDeErro + erro;
		
		var procentagem = (progressoAtual*100)/totalRegistro;
		var bprogresso  = $('#barraProgesso');
		
		bprogresso.text(procentagem.toFixed(0)+'%');
		bprogresso.width(procentagem+"%");
		if(procentagem == 100){
			totalRegistro = totalRegistro - 1;
			output.append('<br>');
			output.append('<span>Total processado: '+totalRegistro+'</span><br>');
			output.append('<span>Sucesso: '+(totalRegistro - numeroDeErro)+'</span><br>');
			output.append('<span>Erros  : '+numeroDeErro+'</span><br>');
			
			var textEncoder  = new CustomTextEncoder('windows-1252', {NONSTANDARD_allowLegacyEncoding: true})
			var nomeArquivo	 = "Log_Processamento_Baixa_Fies_"+dataAtual();
			//console.log(returnExcel);
			returnExcel = textEncoder.encode([returnExcel]);	
			var blob = new Blob([returnExcel], {type: "text/csv;charset=windows-1252;"});
			saveAs(blob, nomeArquivo+".csv", true);

		}
	}
	
	function dataAtual(){
		var data = new Date(),
			dia  = data.getDate().toString(),
			diaF = (dia.length == 1) ? '0'+dia : dia,
			mes  = (data.getMonth()+1).toString(), //+1 pois no getMonth Janeiro começa com zero.
			mesF = (mes.length == 1) ? '0'+mes : mes,
			anoF = data.getFullYear();
			
		return diaF+"/"+mesF+"/"+anoF;
	}
	
	function FormataStringData(data) {
		var dia  = data.split("/")[0];
		var mes  = data.split("/")[1];
		var ano  = data.split("/")[2];

		return '20'+ ano + '-' + ("0"+dia).slice(-2) + '-' + ("0"+mes).slice(-2);
		// Utilizo o .slice(-2) para garantir o formato com 2 digitos.
	}
	
	function FormataStringData2(data) {
		var dia  = data.split("/")[0];
		var mes  = data.split("/")[1];
		var ano  = data.split("/")[2];

		return ("0"+mes).slice(-2) +'/'+("0"+dia).slice(-2)+'20'+ ano;
		// Utilizo o .slice(-2) para garantir o formato com 2 digitos.
	}
	
	return function ps_enviar(arquivo) {
		totalRegistro	= 0;
		progressoAtual	= 0;
		numeroDeErro	= 0;
		totalRegistro 	= arquivo.length - 2;
		estruturaValida = 1
			
		arquivo.forEach(function(vl,index){
			if(index == 0){
				if(vl.toString() != layout){
					estruturaValida = 0;
					return false;
				}
			}else{
				if(estruturaValida == 1){
					if(vl.length > 7){
						if(vl[7] == 'Recebimento'){
							var valorAcrecimo = (vl[9].replace(",", ".")*1) + (vl[10].replace(",", ".")*1);
							data = {action:'retornoFies', cpf:vl[1], numeroParcela:vl[6], respFin:69352, dtPagamento:FormataStringData(vl[0]),valorPago:vl[11].replace(",", "."),valorAcrecimo:valorAcrecimo.toFixed(2)};
							enviar(data);
							//console.log(vl[1]+ '=>'+vl[9]+' + '+vl[10]+' = '+valorAcrecimo.toFixed(2));
						}else{
							if(output.text()=='Log do Resultado'){output.text('');}
							output.append('<span style="color:red;">Tipo Lançamento diferente de "Recebimento" ('+vl[1]+')</span><br>');
							returnExcel	= returnExcel + ';;'+vl[1]+';;-'+vl[11]+';;'+FormataStringData2(vl[0])+';;'+vl[6]+';Tipo Lançamento diferente de "Recebimento"\r\n';
							addProgesso(1);
						}
					}else{
						estruturaValida = 0;
						addProgesso(0);
						
					}
				}
			}
			
		});
	};
	
})();

function altDtCred(){
	var dtOk = $("#dtOk").val(),
		dtEr = $("#dtErro").val();
	
	if(dtOk == '' || dtOk == null){
		alarta(2,'Campo "Data Certa" é obrigatorio');
		return false;
	}
	
	if(dtEr == '' || dtEr == null){
		alarta(2,'Campo "Data Errada" é obrigatorio');
		return false;
	}
	
	telaProcesso(1);
	valor = {action:'updateDtCred',dtOk:dtOk,dtErro:dtEr};

	$.ajax({
		type: "POST",  
		url: "comando/fies/response.php",  
		data: valor,
		dataType: "json",       
		success: function(response){
			if(response.status == 1){
				telaProcesso(2);
				console.log(response.mensagem);
			}else{
				telaProcesso(3,response.mensagem);
			}
		},
		error: function (error) {
			//console.log(error);
			telaProcesso(3,'Erro ao executar o envio');
		}
	});

};

function telaProcesso(processo,msg,titulo,btyes,btno){
			
	var modal	= $("#msgModal");
		msg		= msg	? ' - '+msg	: "";
		titulo	= titulo? titulo 	: "Aviso!";
		btyes	= btyes ? btyes  	: "Continuar";
		btno	= btno  ? btno   	: "Cancelar";
		
	if(processo == 0){modal.modal('hide');}
	
	if(processo == 1){
		modal.find('.modal-header').hide();
		modal.find('.modal-footer').hide();
		modal.find(".texto").hide();
		modal.find('#modalbadyimg').removeClass('iconad icon-secesso icon-erro');
		modal.find(".btn-primary").removeClass("pn");
		modal.find('#modalbadyimg').addClass('loading');
		modal.find('#modalbadytext').text('Processando...');

		modal.modal('show');
	}//Load
	if(processo == 2){
		modal.find('.modal-header').hide();
		modal.find('.modal-footer').show();
		modal.find(".texto").hide();
		modal.find('#modalbadyimg').removeClass('loading icon-erro');
		modal.find('#modalbadyimg').addClass('iconad icon-secesso');
		modal.find('#modalbadytext').text('Processo realizado com sucesso');	
		modal.find('.btn-primary').hide();
		modal.find('#ok').show();
		modal.find('#ok').text("OK");
		modal.find('.btn-secondary').hide();
				
		modal.modal('show');
	}//Sucesso
	if(processo == 3){
		modal.find('.modal-header').hide();
		modal.find('.modal-footer').show();
		modal.find(".texto").hide();
		modal.find('#modalbadyimg').removeClass('loading icon-secesso');
		modal.find('#modalbadyimg').addClass('iconad icon-erro');
		modal.find('#modalbadytext').text('Erro ao realizado processo'+msg);	
		modal.find('.btn-primary').hide();
		modal.find('.btn-secondary').show();
		modal.find('.btn-secondary').text("FECHAR");
		
		modal.modal('show');
	}//Erro
	
	if(processo == 4){
		modal.find('.modal-header').show();
		modal.find('.modal-footer').show();
		modal.find(".texto").show();
		modal.find('#modalbadyimg').removeClass('loading iconad icon-secesso icon-erro');
		modal.find('#modalbadytext').text('');
		modal.find(".titulo").text(titulo);
		modal.find(".texto").html(msg)
		modal.find('.btn-primary').hide();
		modal.find('.btn-secondary').show();
		modal.find('#sv').show();
		modal.find('.close').hide();
		if(btyes == 0){modal.find('#sv').hide();}
		modal.find('#sv').text(btyes);
		if(btno  == 1){modal.find('#cl').hide();}
		modal.find('#cl').text(btno);	
		
		modal.modal('show');
	}//Mensagem
};

function alarta(tipo,mensagem,tempo){

	tempo = (tempo*1000) || 5000;
	
	if(tipo == 1){// Erro
		$('html,body').scrollTop(0);
		$('#msg').css('zIndex', '60');
		$("#msg").addClass("alert-danger");
		$('#id_tx').text("Alerta! ");
		$('#msg_tx').text(mensagem);
		$('#msg').slideDown(800).show(0).delay(tempo).slideUp(300).hide(0);
	}
	if(tipo == 2){// Alerta
		$('html,body').scrollTop(0);
		$("#msg").addClass("alert-warning");
		$('#id_tx').text("Alerta! ");
		$('#msg_tx').text(mensagem);
		$('#msg').slideDown(800).show(0).delay(tempo).slideUp(300).hide(0);	
	}
	if(tipo == 3){// Sucesso
		$('html,body').scrollTop(0);
		$("#msg").addClass("alert-success");
		$('#id_tx').text("Alerta! ");
		$('#msg_tx').text(mensagem);
		$('#msg').slideDown(800).show(0).delay(tempo).slideUp(300).hide(0);	
	}
 };